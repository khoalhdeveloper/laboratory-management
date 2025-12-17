const TestResult = require('../models/testResult.model');
const TestOrder = require('../models/testOrder.model');
const { DOCTOR, NURSE } = require('../constants/typerole');

// =========================================================
//  Add a comment to a test result
// =========================================================
const addComment = async (req, res) => {
    try {
        const { order_code } = req.params;
        const { content } = req.body;
        
        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Content is required'
            });
        }

        const testResult = await TestResult.findOne({ order_code });
        if (!testResult) {
            return res.status(404).json({
                success: false,
                message: 'Test result not found'
            });
        }

        const userid = req.user?.userid || req.user?.username;
        const doctorName = req.user?.fullName || req.user?.username || 'Unknown Doctor';
        
        
        if (!userid) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
        }

        if (!testResult.comments) {
            testResult.comments = [];
        }

        const comment_id = `${order_code}_CMT${testResult.comments.length + 1}`;

        const newComment = {
            comment_id,
            content: content.trim(),
            doctor_name: doctorName,
            doctor_id: userid,
            is_final: false,
            created_at: new Date()
        };

        testResult.comments.push(newComment);
        testResult.updated_at = new Date();
        
        const savedResult = await testResult.save();


        return res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: {
                order_code,
                new_comment: newComment,
                total_comments: savedResult.comments.length
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// =========================================================
//  Get all comments for a test result by order_code
// =========================================================
const getCommentsByOrderCode = async (req, res) => {
    try {
        const { order_code } = req.params;

        const testResult = await TestResult.findOne({ order_code });
        if (!testResult) {
            return res.status(404).json({
                success: false,
                message: 'Test result not found'
            });
        }

        if (!testResult.comments || testResult.comments.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No comments found for this test result',
                data: {
                    order_code,
                    comments_count: 0,
                    final_comments_count: 0,
                    final_comments: [],
                    all_comments: []
                }
            });
        }

        const finalComments = testResult.comments.filter(c => c.is_final);

        return res.status(200).json({
            success: true,
            message: 'Comments retrieved successfully',
            data: {
                order_code,
                comments_count: testResult.comments.length,
                final_comments_count: finalComments.length,
                final_comments: finalComments,
                all_comments: testResult.comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// =========================================================
//  Mark/Unmark a comment as final
// =========================================================
const markFinalComment = async (req, res) => {
    try {
        const { order_code, comment_id } = req.params;
        
        const userid = req.user?.userid || req.user?.username;
        
        if (!userid) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
        }

        const testOrder = await TestOrder.findOne({ order_code });
        if (!testOrder) {
            return res.status(404).json({
                success: false,
                message: 'Test order not found'
            });
        }

        const testResult = await TestResult.findOne({ order_code });
        
        if (!testResult) {
            return res.status(404).json({
                success: false,
                message: 'Test result not found'
            });
        }

        if (!testResult.comments || testResult.comments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No comments found for this test result'
            });
        }

        const commentIndex = testResult.comments.findIndex(c => c.comment_id === comment_id);

        if (commentIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        
        const currentIsFinal = testResult.comments[commentIndex].is_final;

        if (currentIsFinal) {
            testResult.comments[commentIndex].is_final = false;
            await testResult.save();

            return res.status(200).json({
                success: true,
                message: 'Comment unmarked as final successfully',
                data: {
                    comment_id: testResult.comments[commentIndex].comment_id,
                    is_final: false,
                    content: testResult.comments[commentIndex].content,
                    doctor_name: testResult.comments[commentIndex].doctor_name
                }
            });
        } else {
            testResult.comments.forEach((comment, index) => {
                if (index === commentIndex) {
                    comment.is_final = true;  
                } else {
                    comment.is_final = false; 
                }
            });

            await testResult.save();

            return res.status(200).json({
                success: true,
                message: 'Comment marked as final successfully. All other comments have been unmarked.',
                data: {
                    comment_id: testResult.comments[commentIndex].comment_id,
                    is_final: true,
                    content: testResult.comments[commentIndex].content,
                    doctor_name: testResult.comments[commentIndex].doctor_name
                }
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// =========================================================
//  Update a comment's content
// =========================================================
const updateComment = async (req, res) => {
    try {
        const { comment_id } = req.params;
        const { content } = req.body;
        
        const userid = req.user?.userid || req.user?.username;
        
        if (!userid) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
        }

        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Content is required'
            });
        }

        const testResult = await TestResult.findOne({ 
            'comments.comment_id': comment_id 
        });
        
        if (!testResult) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        const commentIndex = testResult.comments.findIndex(c => c.comment_id === comment_id);
        const comment = testResult.comments[commentIndex];

      
        if (comment.doctor_id !== userid) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own comments'
            });
        }

        testResult.comments[commentIndex].content = content.trim();
        testResult.comments[commentIndex].updated_at = new Date();
        await testResult.save();

        return res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            data: testResult.comments[commentIndex]
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// =========================================================
//  Delete a comment by comment_id
// =========================================================
const deleteComment = async (req, res) => {
    try {
        const { comment_id } = req.params;
        
        const userid = req.user?.userid || req.user?.username;
        
        if (!userid) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
        }

        const testResult = await TestResult.findOne({ 
            'comments.comment_id': comment_id 
        });
        
        if (!testResult) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        const commentIndex = testResult.comments.findIndex(c => c.comment_id === comment_id);
        const comment = testResult.comments[commentIndex];

        
        if (comment.doctor_id !== userid) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own comments'
            });
        }

        testResult.comments.splice(commentIndex, 1);
        await testResult.save();

        return res.status(200).json({
            success: true,
            message: 'Comment deleted successfully',
            data: { deleted_comment_id: comment_id }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    addComment,
    getCommentsByOrderCode,
    markFinalComment,
    updateComment,
    deleteComment
};