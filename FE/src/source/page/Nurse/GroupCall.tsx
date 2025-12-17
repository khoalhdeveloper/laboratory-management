import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, Form, message, Card, Tag, Avatar, Spin, Select, Space, Tooltip } from 'antd';
import { VideoCameraOutlined, UserAddOutlined, PhoneOutlined, LogoutOutlined } from '@ant-design/icons';
import { api } from '../Axios/Axios';
import dayjs from 'dayjs';


interface User {
  _id: string;
  userid: string;
  username: string;
  fullName: string;
  role: string;
}

interface Participant {
  userid: string;
  username: string;
  fullName: string;
  joinedAt: string;
  status: 'invited' | 'joined' | 'left';
}

interface Room {
  roomId: string;
  roomName: string;
  hostId: string;
  hostName: string;
  description?: string;
  status: 'active' | 'ended';
  startTime: string;
  endTime?: string;
  maxParticipants: number;
  participants: Participant[];
  activeParticipants?: number;
  isHost?: boolean;
}

const GroupCall: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [form] = Form.useForm();
  const [inviteForm] = Form.useForm();
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const avatarColors = ["#5FB8B3", "#FFA07A", "#8A2BE2", "#FF6347", "#20B2AA"];

  useEffect(() => {
    fetchMyRooms();
  }, []);

  const fetchMyRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/group-calls/my/rooms?status=active');
      const roomsData = res.data.rooms || [];
      setRooms(roomsData);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (values: any) => {
    try {
      await api.post('/group-calls/create', values);
      message.success('Room created successfully!');
      setCreateModalVisible(false);
      form.resetFields();
      fetchMyRooms();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to create room');
    }
  };

  const handleJoinRoom = async (room: Room) => {
    try {
      await api.post(`/group-calls/${room.roomId}/join`);
      message.success('Joined room successfully!');
      
      const zegoUrl = `/nurse/group-call/room/${room.roomId}`;
      window.open(zegoUrl, '_blank');
      
      fetchMyRooms();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to join room');
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    try {
      await api.post(`/group-calls/${roomId}/leave`);
      message.success('Left room successfully!');
      fetchMyRooms();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to leave room');
    }
  };

  const handleEndRoom = async (roomId: string) => {
    try {
      await api.post(`/group-calls/${roomId}/end`);
      message.success('Room ended and deleted successfully!');
      await fetchMyRooms();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to end room');
    }
  };

  const showInviteModal = async (room: Room) => {
    setSelectedRoom(room);
    setInviteModalVisible(true);
    setSelectedUsers([]);
    fetchAvailableUsers();
  };

  const fetchAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/user/accounts/nurses-and-doctors');
      const users = res.data.accounts || [];
      
      const existingUserIds = selectedRoom?.participants.map(p => p.userid) || [];
      const filteredUsers = users.filter((user: User) => 
        !existingUserIds.includes(user.userid)
      );
      
      setAvailableUsers(filteredUsers);
    } catch (err: any) {
      message.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInviteParticipants = async () => {
    if (!selectedRoom || selectedUsers.length === 0) {
      message.warning('Please select at least one user to invite');
      return;
    }

    try {
      const participants = selectedUsers.map(userId => {
        const user = availableUsers.find(u => u.userid === userId);
        return {
          userid: user!.userid,
          username: user!.username,
          fullName: user!.fullName
        };
      });

      await api.post(`/group-calls/${selectedRoom.roomId}/invite`, { participants });
      message.success(`Invited ${participants.length} participant(s)!`);
      setInviteModalVisible(false);
      setSelectedUsers([]);
      inviteForm.resetFields();
      fetchMyRooms();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to invite participants');
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
              <VideoCameraOutlined className="mr-2 sm:mr-3" />
              <span className="hidden sm:inline">Group Video Calls</span>
              <span className="sm:hidden">Video Calls</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              <span className="hidden sm:inline">Create rooms and invite people to join video conferences</span>
              <span className="sm:hidden">Create and join video rooms</span>
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<VideoCameraOutlined />}
            onClick={() => setCreateModalVisible(true)}
            className="bg-[#5FB8B3] hover:bg-[#2c7a75] w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Create New Room</span>
            <span className="sm:hidden">Create Room</span>
          </Button>
        </div>

        {/* Rooms List */}
        <Spin spinning={loading}>
          {rooms.length === 0 ? (
            <Card className="text-center py-8 sm:py-12 dark:bg-gray-800 dark:border-gray-700">
              <VideoCameraOutlined className="text-4xl sm:text-6xl text-gray-300 dark:text-gray-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-2">No active rooms</h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-500 mb-4 px-4">Create a new room to start a group call</p>
              <Button
                type="primary"
                icon={<VideoCameraOutlined />}
                onClick={() => setCreateModalVisible(true)}
                className="bg-[#5FB8B3] hover:bg-[#2c7a75]"
              >
                Create Room
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {rooms.map((room) => {
                return (
                <Card
                  key={room.roomId}
                  className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow"
                  actions={[
                    <Button
                      key="join"
                      type="primary"
                      icon={<PhoneOutlined />}
                      onClick={() => handleJoinRoom(room)}
                      className="bg-green-500 hover:bg-green-600 text-xs sm:text-sm"
                      size="small"
                    >
                      <span className="hidden sm:inline">Join</span>
                    </Button>,
                    room.isHost && (
                      <Button
                        key="invite"
                        icon={<UserAddOutlined />}
                        onClick={() => showInviteModal(room)}
                        className="text-xs sm:text-sm"
                        size="small"
                      >
                        <span className="hidden sm:inline">Invite</span>
                      </Button>
                    ),
                    room.isHost ? (
                      <Button
                        key="end"
                        danger
                        icon={<LogoutOutlined />}
                        onClick={() => handleEndRoom(room.roomId)}
                        className="text-xs sm:text-sm"
                        size="small"
                      >
                        <span className="hidden sm:inline">End</span>
                      </Button>
                    ) : (
                      <Button
                        key="leave"
                        icon={<LogoutOutlined />}
                        onClick={() => handleLeaveRoom(room.roomId)}
                        className="text-xs sm:text-sm"
                        size="small"
                      >
                        <span className="hidden sm:inline">Leave</span>
                      </Button>
                    )
                  ].filter(Boolean)}
                >
                  <div className="mb-3 sm:mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-200 break-words pr-2">
                        {room.roomName}
                      </h3>
                      {room.isHost && (
                        <Tag color="blue" className="flex-shrink-0">Host</Tag>
                      )}
                    </div>
                    
                    {room.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 break-words">
                        {room.description}
                      </p>
                    )}

                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <UserAddOutlined className="mr-1.5 sm:mr-2 flex-shrink-0" />
                        <span className="truncate">Host: <span className="font-medium ml-1">{room.hostName}</span></span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <VideoCameraOutlined className="mr-1.5 sm:mr-2 flex-shrink-0" />
                        Participants: <span className="font-medium ml-1">
                          {room.activeParticipants || (room.participants || []).filter(p => p.status === 'joined').length} / {room.maxParticipants}
                        </span>
                      </div>

                      <div className="text-gray-500 dark:text-gray-500 text-xs">
                        <span className="hidden sm:inline">Started: {dayjs(room.startTime).format('MMM DD, YYYY HH:mm')}</span>
                        <span className="sm:hidden">{dayjs(room.startTime).format('DD/MM HH:mm')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Participants List */}
                  {room.participants && room.participants.length > 0 && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                        <span className="hidden sm:inline">Active Participants:</span>
                        <span className="sm:hidden">Participants:</span>
                      </p>

                 <Avatar.Group maxCount={5} size="small" className="hidden sm:flex">
                    {room.participants
                 .filter(p => p.status === 'joined')
                 .map((p, idx) => {
                 const bgColor = avatarColors[idx % avatarColors.length]; // chọn màu đa dạng
                 const firstChar = p.fullName?.charAt(0) || p.username?.charAt(0) || '?';
                   return (
                 <Tooltip key={p.userid} title={p.fullName || p.username || 'Unknown'}>
                  <Avatar style={{ backgroundColor: bgColor, fontWeight: 'bold' }}>
                    {firstChar.toUpperCase()}
                  </Avatar>
                  </Tooltip>
                        );
                         })
                          }
                  </Avatar.Group>
                    </div>
                  )}
                </Card>
                );
              })}
            </div>
          )}
        </Spin>

        {/* Create Room Modal */}
        <Modal
          title="Create New Room"
          open={createModalVisible}
          onCancel={() => {
            setCreateModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width="95%"
          style={{ maxWidth: '500px' }}
          className="top-4"
        >
          <Form form={form} onFinish={handleCreateRoom} layout="vertical">
            <Form.Item
              name="roomName"
              label="Room Name"
              rules={[{ required: true, message: 'Please enter room name' }]}
            >
              <Input placeholder="e.g., Team Meeting" size="large" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="Optional description..." size="large" />
            </Form.Item>

            <Form.Item
              name="maxParticipants"
              label="Max Participants"
              initialValue={10}
              rules={[{ required: true, message: 'Please enter max participants' }]}
            >
              <Input type="number" min={2} max={50} size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" className="bg-[#5FB8B3] hover:bg-[#2c7a75]">
                Create Room
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Invite Participants Modal */}
        <Modal
          title={
            <div className="text-sm sm:text-base">
              Invite Participants to <span className="font-bold">{selectedRoom?.roomName}</span>
            </div>
          }
          open={inviteModalVisible}
          onCancel={() => {
            setInviteModalVisible(false);
            setSelectedUsers([]);
          }}
          width="95%"
          style={{ maxWidth: '600px' }}
          className="top-4"
          footer={[
            <Button 
              key="cancel" 
              onClick={() => {
                setInviteModalVisible(false);
                setSelectedUsers([]);
              }}
              className="text-xs sm:text-sm"
            >
              Cancel
            </Button>,
            <Button
              key="invite"
              type="primary"
              onClick={handleInviteParticipants}
              loading={loadingUsers}
              disabled={selectedUsers.length === 0}
              className="bg-[#5FB8B3] hover:bg-[#2c7a75] text-xs sm:text-sm"
            >
              Invite {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
            </Button>
          ]}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">Select Users to Invite</label>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Search and select users..."
                value={selectedUsers}
                onChange={setSelectedUsers}
                loading={loadingUsers}
                optionFilterProp="label"
                showSearch
                size="large"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={availableUsers.map(user => ({
                  value: user.userid,
                  label: `${user.fullName} (${user.username}) - ${user.role}`,
                  user: user
                }))}
                maxTagCount="responsive"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {availableUsers.length} user(s) available
              </p>
            </div>

            {selectedUsers.length > 0 && (
              <div className="border-t pt-4 dark:border-gray-700">
                <p className="text-xs sm:text-sm font-medium mb-2">Selected Users:</p>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {selectedUsers.map(userId => {
                    const user = availableUsers.find(u => u.userid === userId);
                    return user ? (
                      <div key={userId} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <Avatar className="bg-[#5FB8B3]" size="small">
                          {user.fullName.charAt(0).toUpperCase()}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-medium dark:text-white truncate">{user.fullName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.username} • {user.role}
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </Space>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default GroupCall;
