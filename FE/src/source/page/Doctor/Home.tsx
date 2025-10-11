
/**
 * Doctor Home component - Nội dung chính của trang Doctor
 * Authentication đã được xử lý ở DoctorLayout
 */
function Home() {
    return (
        <div className="flex h-screen bg-gray-50 items-center justify-center">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Doctor Dashboard</h1>
                <p className="text-gray-600">Chào mừng đến với trang quản lý của Bác sĩ</p>
            </div>
        </div>
    );
}

export default Home;