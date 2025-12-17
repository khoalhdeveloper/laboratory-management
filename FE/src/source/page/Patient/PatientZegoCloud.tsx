import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";


const getUserInfoFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return { userId: null, fullName: null };

  try {
    
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

const PatientZegoCloud = () => {
  const { consultationId } = useParams<{ consultationId: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const { userId, fullName } = getUserInfoFromToken();
  const finalUserId = userId || localStorage.getItem("userid");
  const finalFullName = fullName || localStorage.getItem("userName") || `User ${finalUserId}`;

  useEffect(() => {
    if (!consultationId || !finalUserId) {
      message.error("Missing information consultationId or userId!");
      navigate("/patient/schedule");
      return;
    }

    let mounted = true;
    let zc: any = null;

    const initZegoUIKit = async () => {
    
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!mounted || !containerRef.current) {
        return;
      }

      try {
        const appId = 555872631;
        const serverSecret = "7afeaddb0e5ac77838e5051902275cdc";
        const roomId = consultationId;

        
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appId,
          serverSecret,
          roomId,
          finalUserId,
          finalFullName 
        );

        zc = ZegoUIKitPrebuilt.create(kitToken);

        zc.joinRoom({
          container: containerRef.current!,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          showPreJoinView: false,
          showScreenSharingButton: false,
          showTextChat: true,
          showUserList: true,
          maxUsers: 2,
          onLeaveRoom: () => {
            navigate("/patient/schedule");
          },
        });
      } catch (err: any) {
        if (mounted) {
          message.error("Unable to connect ZegoCloud: " + err.message);
          setTimeout(() => navigate("/patient/schedule"), 2000);
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
  }, [consultationId, userId, navigate]);

  return (
    <div className="w-full h-screen bg-gray-900">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default PatientZegoCloud;
