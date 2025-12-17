import React, { useState, useEffect } from 'react';

interface BlogPost {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  source: string;
  sourceUrl: string;
  category: 'technology' | 'health' | 'education' | 'science' | 'general';
  publishedAt: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const categoryNames = {
  technology: 'Công nghệ',
  health: 'Sức khỏe',
  education: 'Giáo dục',
  science: 'Khoa học',
  general: 'Tổng hợp'
};

const AdminBlog: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchBlogs = async (page = 1, category = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/blogs?page=${page}&category=${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBlogs(data.data.blogs);
        setPagination(data.data.pagination);
      } else {
        setError('Không thể tải danh sách tin tức');
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const toggleBlogVisibility = async (id: number) => {
    try {
      setUpdating(id);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/blogs/${id}/toggle-visibility`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Cập nhật trạng thái local
        setBlogs(prevBlogs => 
          prevBlogs.map(blog => 
            blog.id === id ? { ...blog, isVisible: !blog.isVisible } : blog
          )
        );
      } else {
        setError(data.message || 'Không thể cập nhật trạng thái bài viết');
      }
    } catch (err) {
      setError('Lỗi khi cập nhật trạng thái bài viết');
    } finally {
      setUpdating(null);
    }
  };

  const deleteBlog = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      return;
    }

    try {
      setUpdating(id);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Xóa khỏi danh sách local
        setBlogs(prevBlogs => prevBlogs.filter(blog => blog.id !== id));
      } else {
        setError(data.message || 'Không thể xóa bài viết');
      }
    } catch (err) {
      setError('Lỗi khi xóa bài viết');
    } finally {
      setUpdating(null);
    }
  };

  const updateNewsFromAPI = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/blogs/update-news', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Cập nhật thành công: ${data.data.addedCount} tin mới, ${data.data.skippedCount} tin đã tồn tại`);
        fetchBlogs(pagination.currentPage, selectedCategory);
      } else {
        setError(data.message || 'Không thể cập nhật tin tức');
      }
    } catch (err) {
      setError('Lỗi khi cập nhật tin tức từ API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(1, selectedCategory);
  }, [selectedCategory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (page: number) => {
    fetchBlogs(page, selectedCategory);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Blog tin tức</h1>
        <p className="text-gray-600">Quản lý hiển thị và cập nhật tin tức tự động</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-4 items-center">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="all">Tất cả danh mục</option>
              {Object.entries(categoryNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
            
            <button
              onClick={() => fetchBlogs(pagination.currentPage, selectedCategory)}
              className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              🔄 Làm mới
            </button>
          </div>

          <button
            onClick={updateNewsFromAPI}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            📰 Cập nhật tin từ API
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-800">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-4 text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      )}

      {/* Blog List */}
      {!loading && (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bài viết
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nguồn
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đăng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {blogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          {blog.imageUrl && (
                            <img
                              src={blog.imageUrl}
                              alt={blog.title}
                              className="w-16 h-16 rounded object-cover flex-shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                              {blog.title}
                            </h3>
                            {blog.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {blog.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {categoryNames[blog.category]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {blog.source}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(blog.publishedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          blog.isVisible 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {blog.isVisible ? 'Hiển thị' : 'Ẩn'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleBlogVisibility(blog.id)}
                            disabled={updating === blog.id}
                            className={`px-3 py-1 text-xs rounded transition-colors ${
                              blog.isVisible
                                ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {updating === blog.id ? '⏳' : blog.isVisible ? '👁️‍🗨️ Ẩn' : '👁️ Hiện'}
                          </button>
                          
                          <button
                            onClick={() => window.open(blog.sourceUrl, '_blank')}
                            className="px-3 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                          >
                            🔗 Xem
                          </button>
                          
                          <button
                            onClick={() => deleteBlog(blog.id)}
                            disabled={updating === blog.id}
                            className="px-3 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updating === blog.id ? '⏳' : '🗑️ Xóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Hiển thị {blogs.length} trong tổng số {pagination.totalItems} bài viết
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Trước
                </button>
                
                <span className="px-3 py-2 text-sm">
                  Trang {pagination.currentPage} / {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && blogs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📰</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có tin tức nào</h3>
          <p className="text-gray-500 mb-4">Nhấn nút "Cập nhật tin từ API" để tải tin tức mới</p>
          <button
            onClick={updateNewsFromAPI}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            📰 Cập nhật tin từ API
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;