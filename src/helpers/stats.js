const {Image, Comment} = require('../models');

async function imageCounter(){
    return await Image.countDocuments();
};

async function commnentsCounter(){
    return await Comment.countDocuments();
};

async function imagesTotalViewsCounter(){
    const result = await Image.aggregate([{$group: {
        _id: '1',
        viewsTotal: {$sum: '$views'}
    }}]);
    return result[0].viewsTotal;
};

async function totalLikesCounter(){
    const result = await Image.aggregate([{$group: {
        _id: '1',
        likesTotal: {$sum: '$likes'}
    }}]);
    return result[0].likesTotal;
};

module.exports = async () => {
    const results = await Promise.all([
        imageCounter(),
        commnentsCounter(),
        imagesTotalViewsCounter(),
        totalLikesCounter()
    ]);
    return {
        image: results[0],
        comments: results[1],
        views: results[2],
        likes: results[3]
    }
};