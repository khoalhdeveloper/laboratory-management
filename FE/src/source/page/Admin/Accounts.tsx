import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import { Search, Plus, Users, UserCheck, UserX, Shield, Lock, Unlock, Edit, Crown, Key } from "lucide-react";

// User interface
interface User {
  _id: string;
  userid: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  identifyNumber?: string;
  age?: number;
  address?: string;
  dateOfBirth?: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const Accounts = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles] = useState<Role[]>([
    { id: "1", name: "admin", description: "System Administrator", permissions: ["all"] },
    { id: "2", name: "user", description: "Regular User", permissions: ["read"] },
    { id: "3", name: "doctor", description: "Blood Test Doctor", permissions: ["read", "write", "medical"] },
    { id: "4", name: "nurse", description: "Medical Nurse", permissions: ["read", "write", "patient"] },
  ]);
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User form state
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    fullName: "",
    phoneNumber: "",
    role: "user",
    password: "",
  });

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Form errors
  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  // Hardcoded users data
  const hardcodedUsers: User[] = [
    {
      _id: "1",
      userid: "USR001",
      username: "admin",
      email: "admin@lab.com",
      fullName: "Admin User",
      phoneNumber: "0123456789",
      role: "admin",
      isActive: true,
      createdAt: "2024-01-15",
    },
    {
      _id: "2",
      userid: "USR002",
      username: "dr_nguyen",
      email: "dr.nguyen@lab.com",
      fullName: "Dr. Nguyen Van A",
      phoneNumber: "0987654321",
      role: "user",
      isActive: true,
      createdAt: "2024-02-20",
    },
    {
      _id: "3",
      userid: "USR003",
      username: "nurse_tran",
      email: "nurse.tran@lab.com",
      fullName: "Nurse Tran Thi B",
      phoneNumber: "0912345678",
      role: "nurse",
      isActive: true,
      createdAt: "2024-03-10",
    },
    {
      _id: "4",
      userid: "USR004",
      username: "patient_le",
      email: "patient.le@gmail.com",
      fullName: "Le Van C",
      phoneNumber: "0901234567",
      role: "user",
      isActive: true,
      createdAt: "2024-04-05",
    },
    {
      _id: "5",
      userid: "USR005",
      username: "staff_pham",
      email: "staff.pham@lab.com",
      fullName: "Pham Thi D",
      phoneNumber: "0898765432",
      role: "user",
      isActive: false,
      createdAt: "2024-05-12",
    },
    {
      _id: "6",
      userid: "USR006",
      username: "dr_hoang",
      email: "dr.hoang@lab.com",
      fullName: "Dr. Hoang Van E",
      phoneNumber: "0876543210",
      role: "doctor",
      isActive: true,
      createdAt: "2024-06-18",
    },
    {
      _id: "7",
      userid: "USR007",
      username: "nurse_vo",
      email: "nurse.vo@lab.com",
      fullName: "Nurse Vo Thi F",
      phoneNumber: "0865432109",
      role: "nurse",
      isActive: false,
      createdAt: "2024-07-22",
    },
    {
      _id: "8",
      userid: "USR008",
      username: "dr_duong",
      email: "dr.duong@lab.com",
      fullName: "Dr. Duong Van G",
      phoneNumber: "0854321098",
      role: "doctor",
      isActive: true,
      createdAt: "2024-08-30",
    },
  ];

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(hardcodedUsers);
      console.log("✅ Loaded hardcoded users:", hardcodedUsers.length, "users");
    } catch (error) {
      console.error("❌ Error loading users:", error);
      setError("Failed to fetch users");
      setUsers([]);
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: any = {};
    
    if (!userForm.username.trim()) {
      errors.username = "Username is required";
    }
    
    if (!userForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userForm.email)) {
      errors.email = "Invalid email format";
    }
    
    if (!userForm.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    
    if (!editingUser && !userForm.password) {
      errors.password = "Password is required";
    }
    
    // Password change validation
    if (editingUser && showPasswordChange) {
      if (!newPassword.trim()) {
        errors.newPassword = "New password is required";
      } else if (newPassword.length < 6) {
        errors.newPassword = "Password must be at least 6 characters";
      }
      
      if (!confirmPassword.trim()) {
        errors.confirmPassword = "Please confirm your password";
      } else if (newPassword !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({
      username: "",
      email: "",
      fullName: "",
      phoneNumber: "",
      role: "user",
      password: "",
    });
    setShowPasswordChange(false);
    setNewPassword("");
    setConfirmPassword("");
    setFormErrors({});
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber || "",
      role: user.role,
      password: "",
    });
    setShowPasswordChange(false);
    setNewPassword("");
    setConfirmPassword("");
    setFormErrors({});
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!validateForm()) {
      showToast("Please fill in all required fields correctly", "error");
      return;
    }

    try {
      setLoading(true);

      if (editingUser) {
        // Update existing user
        const updatedUsers = users.map(user => 
          user.userid === editingUser.userid 
            ? {
                ...user,
                username: userForm.username,
                email: userForm.email,
                fullName: userForm.fullName,
                phoneNumber: userForm.phoneNumber || undefined,
                role: userForm.role,
                updatedAt: new Date().toISOString()
              }
            : user
        );
        setUsers(updatedUsers);
        
        // Show success message based on password change
        if (showPasswordChange && newPassword) {
          showToast("Account and password updated successfully!", "success");
        } else {
          showToast("Account updated successfully!", "success");
        }
      } else {
        // Create new user
        const newUser: User = {
          _id: Date.now().toString(),
          userid: `USR${String(users.length + 1).padStart(3, '0')}`,
          username: userForm.username,
          email: userForm.email,
          fullName: userForm.fullName,
          phoneNumber: userForm.phoneNumber || undefined,
          role: userForm.role,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        setUsers([...users, newUser]);
        showToast("New account created successfully!", "success");
      }

      setShowUserModal(false);
    } catch (error: any) {
      console.error("Error saving user:", error);
      showToast("Unable to save account. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = (user: User) => {
    setUserToToggle(user);
    setShowDeleteConfirm(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;

    const newStatus = !userToToggle.isActive;
    const action = newStatus ? "unlock" : "lock";

    try {
      setLoading(true);
      
      // Update user status in local state
      setUsers(users.map(u => 
        u.userid === userToToggle.userid ? { ...u, isActive: newStatus } : u
      ));
      
      showToast(`Account ${action}ed successfully!`, "success");
    } catch (error: any) {
      console.error("Error toggling user status:", error);
      showToast(`Unable to ${action} account. Please try again.`, "error");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setUserToToggle(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchRole = filterRole === "all" || user.role === filterRole;
    const matchStatus = filterStatus === "all" || 
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "locked" && !user.isActive);
    
    return matchSearch && matchRole && matchStatus;
  });

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const lockedUsers = users.filter(u => !u.isActive).length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const doctorCount = users.filter(u => u.role === "doctor").length;
  const nurseCount = users.filter(u => u.role === "nurse").length;

  const getRoleIcon = (role: string) => {
    switch(role) {
      case "admin":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
          </svg>
        );
      case "doctor":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
          </svg>
        );
      case "nurse":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
          </svg>
        );
    }
  };

    return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Account Management</h1>
            <p className="text-muted-foreground">Manage users and permissions in the system</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Users</div>
              <div className="text-2xl font-bold">{totalUsers}</div>
            </div>
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
              <p className="text-green-500 text-xs font-medium mt-2">↑ 5% from last week</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{activeUsers}</div>
              <p className="text-green-500 text-xs font-medium mt-2">↑ 12% from last week</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-violet-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locked Users</CardTitle>
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <Lock className="h-5 w-5 text-violet-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{lockedUsers}</div>
              <p className="text-violet-500 text-xs font-medium mt-2">→ 2% from last week</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Crown className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{adminCount}</div>
              <p className="text-amber-500 text-xs font-medium mt-2">→ 0% from last week</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doctors</CardTitle>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{doctorCount}</div>
              <p className="text-green-500 text-xs font-medium mt-2">↑ 8% from last week</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nurses</CardTitle>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{nurseCount}</div>
              <p className="text-blue-500 text-xs font-medium mt-2">↑ 12% from last week</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Find users by name, email, username, or filter by role and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, username..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex gap-4">
                <select
                  value={filterRole}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="all">All roles</option>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="user">User</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="locked">Locked</option>
                </select>

                {/* Add Button */}
                <Button onClick={handleAddUser} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4" />
                  Add User
                </Button>
              </div>
            </div>

            {/* Active Filters Info */}
            {(filterRole !== "all" || filterStatus !== "all" || searchTerm) && (
              <div className="mt-4 flex items-center gap-2 text-sm flex-wrap">
                <span className="text-muted-foreground font-medium">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary">Search: "{searchTerm}"</Badge>
                )}
                {filterRole !== "all" && (
                  <Badge variant="secondary">Role: {filterRole}</Badge>
                )}
                {filterStatus !== "all" && (
                  <Badge variant="secondary">Status: {filterStatus}</Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterRole("all");
                    setFilterStatus("all");
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
            <CardDescription>Manage and monitor user accounts in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                          <span className="text-muted-foreground">Loading users...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-destructive" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Error Loading Users</h3>
                          <p className="text-muted-foreground mb-4">{error}</p>
                          <Button onClick={fetchUsers} variant="destructive">
                            Try Again
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                          <p className="text-muted-foreground">No users match your current search criteria.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <span className="font-mono text-sm font-medium">{user.userid}</span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{user.username}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{user.fullName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">{user.phoneNumber || "—"}</div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary"
                            className={`flex items-center gap-1 ${
                              user.role === "admin" 
                                ? "bg-amber-100 text-amber-700 border-amber-200" 
                                : user.role === "doctor" 
                                ? "bg-green-100 text-green-700 border-green-200" 
                                : user.role === "nurse"
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {getRoleIcon(user.role)}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary"
                            className={`flex items-center gap-1 ${
                              user.isActive 
                                ? "bg-green-100 text-green-700 border-green-200" 
                                : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {user.isActive ? (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3 mr-1" />
                                Locked
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleUserStatus(user)}
                              className={user.isActive ? "text-violet-600 hover:text-violet-700 hover:bg-violet-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                            >
                              {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* User Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {editingUser ? "Edit User" : "Add New User"}
                </DialogTitle>
                <DialogDescription className="text-base mt-1">
                  {editingUser ? "Update user information and permissions" : "Create new user account with role assignment"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Username <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={userForm.username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserForm({ ...userForm, username: e.target.value })}
                    placeholder="john_doe"
                    className={`h-11 ${formErrors.username ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {formErrors.username && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {formErrors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={userForm.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="user@lab.com"
                    className={`h-11 ${formErrors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={userForm.fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserForm({ ...userForm, fullName: e.target.value })}
                    placeholder="John Doe"
                    className={`h-11 ${formErrors.fullName ? 'border-red-500 focus:border-red-500' : 'focus:border-green-500'}`}
                  />
                  {formErrors.fullName && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {formErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Phone Number
                  </label>
                  <Input
                    type="text"
                    value={userForm.phoneNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                    placeholder="0987654321"
                    className="h-11 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Account Settings Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Crown className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
              </div>
              <div className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    Role Assignment <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          userForm.role === role.name
                            ? role.name === "admin" 
                              ? "border-amber-500 bg-amber-50"
                              : role.name === "doctor"
                              ? "border-green-500 bg-green-50"
                              : role.name === "nurse"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-500 bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setUserForm({ ...userForm, role: role.name })}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            role.name === "admin" 
                              ? "bg-amber-100 text-amber-600"
                              : role.name === "doctor"
                              ? "bg-green-100 text-green-600"
                              : role.name === "nurse"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {getRoleIcon(role.name)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{role.name.toUpperCase()}</h4>
                            <p className="text-sm text-gray-600">{role.description}</p>
                          </div>
                          {userForm.role === role.name && (
                            <div className="ml-auto">
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Password - Only for new users */}
                {!editingUser && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                      Initial Password <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="password"
                      value={userForm.password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder="Enter secure password"
                      className={`h-11 ${formErrors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-violet-500'}`}
                    />
                    {formErrors.password && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {formErrors.password}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">User can change this password after first login</p>
                  </div>
                )}

                {/* Password Change - Only for editing users */}
                {editingUser && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Key className="w-4 h-4 text-violet-600" />
                        Password Management
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowPasswordChange(!showPasswordChange);
                          setNewPassword("");
                          setConfirmPassword("");
                          setFormErrors({ ...formErrors, newPassword: "", confirmPassword: "" });
                        }}
                        className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                      >
                        {showPasswordChange ? "Cancel Change" : "Change Password"}
                      </Button>
                    </div>
                    
                    {showPasswordChange && (
                      <div className="space-y-4 p-4 bg-violet-50 rounded-lg border border-violet-200">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-violet-700">
                            New Password <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="password"
                            value={newPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className={`h-11 ${formErrors.newPassword ? 'border-red-500 focus:border-red-500' : 'focus:border-violet-500'}`}
                          />
                          {formErrors.newPassword && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              {formErrors.newPassword}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-violet-700">
                            Confirm New Password <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className={`h-11 ${formErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'focus:border-violet-500'}`}
                          />
                          {formErrors.confirmPassword && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              {formErrors.confirmPassword}
                            </p>
                          )}
                        </div>
                        
                        <p className="text-xs text-violet-600">
                          Password must be at least 6 characters long
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Role Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  userForm.role === "admin" 
                    ? "bg-amber-100 text-amber-600"
                    : userForm.role === "doctor"
                    ? "bg-green-100 text-green-600"
                    : userForm.role === "nurse"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {getRoleIcon(userForm.role)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{userForm.role.toUpperCase()}</h4>
                  <p className="text-sm text-gray-600">{roles.find(r => r.name === userForm.role)?.description}</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-gray-100">
            <Button 
              variant="outline" 
              onClick={() => setShowUserModal(false)} 
              disabled={loading}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveUser} 
              disabled={loading}
              className="h-11 px-6 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  {editingUser ? "Update User" : "Create User"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {userToToggle?.isActive ? "Lock Account?" : "Unlock Account?"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {userToToggle?.isActive ? "lock" : "unlock"} the account "{userToToggle?.username}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeleteConfirm(false);
              setUserToToggle(null);
            }}>
              Cancel
            </Button>
            <Button 
              variant={userToToggle?.isActive ? "destructive" : "default"}
              onClick={confirmToggleStatus}
              className={userToToggle?.isActive ? "bg-violet-600 hover:bg-violet-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
            >
              {userToToggle?.isActive ? "Lock Account" : "Unlock Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
    );
};

export default Accounts;
