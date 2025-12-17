import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

// Helper để decode JWT token với hỗ trợ UTF-8
const getUserInfoFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return { userId: null, fullName: null };
  
  try {
    // Decode base64 với hỗ trợ UTF-8
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    
    return {
      userId: payload.userid || payload.userId || payload.id,
      fullName: payload.fullName || payload.username || `User ${payload.userid}`
    };
  } catch (e) {
    return { userId: null, fullName: null };
  }
};

const NurseZegoCloud = () => {
  const { consultationId, roomId } = useParams<{ consultationId?: string; roomId?: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const { userId, fullName } = getUserInfoFromToken();
  const finalUserId = userId || localStorage.getItem("userid") || localStorage.getItem("userId") || "";
  const finalFullName = fullName || localStorage.getItem("userName") || `Nurse ${finalUserId}`;
  
  // Determine which type of call: consultation (1-on-1) or group call
  const isGroupCall = !!roomId;
  const callId = roomId || consultationId;

  useEffect(() => {
    if (!callId || !finalUserId) {
      message.error("Missing call information or userId!");
      navigate(isGroupCall ? "/nurse/group-call" : "/nurse/schedule");
      return;
    }

    let mounted = true;
    let zc: any = null;

    const initZegoUIKit = async () => {
      
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!mounted || !containerRef.current) {
        return;
      }

      try {
        const appId = 555872631;
        const serverSecret = "7afeaddb0e5ac77838e5051902275cdc";
        const roomIdForCall = callId!;

       
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appId,
          serverSecret,
          roomIdForCall,
          finalUserId,
          finalFullName 
        );

        zc = ZegoUIKitPrebuilt.create(kitToken);

        zc.joinRoom({
          container: containerRef.current!,
          scenario: {
            mode: isGroupCall 
              ? ZegoUIKitPrebuilt.GroupCall 
              : ZegoUIKitPrebuilt.OneONoneCall,
          },
          showPreJoinView: false,
          showScreenSharingButton: isGroupCall,
          showTextChat: true,
          showUserList: true,
          maxUsers: isGroupCall ? 10 : 2,
          videoResolutionDefault: ZegoUIKitPrebuilt.VideoResolution_720P,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showLayoutButton: true,
          
          whiteboardConfig: {
            showAddImageButton: true,
          },
       
          turnOnCameraWhenJoining: true,
          turnOnMicrophoneWhenJoining: true,
          useFrontFacingCamera: true,
          onLeaveRoom: () => {
            navigate(isGroupCall ? "/nurse/group-call" : "/nurse/schedule");
          },
        });
      } catch (err: any) {
        if (mounted) {
          message.error("Unable to connect ZegoCloud: " + err.message);
          setTimeout(() => navigate(isGroupCall ? "/nurse/group-call" : "/nurse/schedule"), 2000);
        }
      }
    };

    initZegoUIKit();

    return () => {
      mounted = false;
      if (zc) {
        try {
          zc.destroy();
        } catch (e) {
        }
      }
    };
  }, [callId, finalUserId, isGroupCall, navigate]);

  return (
    <div className="w-full h-screen bg-gray-900">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default NurseZegoCloud;
