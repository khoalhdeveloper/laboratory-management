const Blog = require('../models/blog.model');
const axios = require('axios');

const getPublicBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ 
            isVisible: true,
            imageUrl: { $exists: true, $ne: null, $ne: '' }
        })
            .select('title description imageUrl source category publishedAt sourceUrl')
            .sort({ publishedAt: -1 });

        res.status(200).json({
            success: true,
            data: blogs
        });
    } catch (error) {
        console.error('Error fetching public blogs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching public blogs'
        });
    }
};



const fetchNewsFromGoogleAPI = async () => {
    try {
        if (!process.env.NEWS_API_KEY) {
            return [];
        }

        const response = await axios.get(`https://newsapi.org/v2/everything`, {
            params: {
                q: 'hospital medical health',
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: 20,
                from: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
                apiKey: process.env.NEWS_API_KEY 
            }
        });

        if (response.data.articles) {
            const articles = response.data.articles
                .filter(article => {
                    const title = article.title?.toLowerCase() || '';
                    const desc = article.description?.toLowerCase() || '';
                    
                    const keywords = ['hospital', 'medical', 'health', 'clinic', 'doctor', 'patient'];
                    const hasRelevantKeyword = keywords.some(keyword => 
                        title.includes(keyword) || desc.includes(keyword)
                    );
                    
                    return hasRelevantKeyword;
                })
                .map(article => ({
                    title: article.title,
                    description: article.description,
                    content: article.content,
                    imageUrl: article.urlToImage,
                    source: article.source.name,
                    sourceUrl: article.url,
                    category: 'health',
                    publishedAt: new Date(article.publishedAt),
                    externalId: `newsapi_${article.url.split('/').pop()}`
                }));
            return articles.slice(0, 10);
        }
        return [];
    } catch (error) {
        return [];
    }
};







const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({})
            .sort({ publishedAt: -1 })
            .select('title description imageUrl source category publishedAt sourceUrl isVisible createdAt');

        res.status(200).json({
            success: true,
            data: blogs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching all blogs'
        });
    }
};

const getNewsFromAPI = async (req, res) => {
    try {
        const apiArticles = await fetchNewsFromGoogleAPI();
        
        if (apiArticles.length === 0) {
            return res.json({ 
                success: true, 
                data: [],
                summary: {
                    fromAPI: 0,
                    total: 0,
                    lastUpdated: new Date().toISOString(),
                    note: 'NewsAPI temporarily unavailable. Please try again later.'
                }
            });
        }

        const formattedNewsData = apiArticles.map((article, index) => ({
            id: `news_${Date.now()}_${index}`,
            title: article.title,
            description: article.description,
            imageUrl: article.imageUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=200&fit=crop&crop=center',
            source: article.source,
            sourceUrl: article.sourceUrl,
            category: article.category,
            publishedAt: article.publishedAt,
            isFromAPI: true
        }));

        res.json({ 
            success: true, 
            data: formattedNewsData,
            summary: {
                fromAPI: formattedNewsData.length,
                total: formattedNewsData.length,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch latest news. API may be unavailable.',
            error: error.message 
        });
    }
};



module.exports = {
    getPublicBlogs,
    getAllBlogs,
    getNewsFromAPI
};


