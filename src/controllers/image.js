const path = require('path');
const fs = require('fs-extra');
const md5 = require('md5');

const {randomNumber} = require('../helpers/libs');
const {Image, Comment} = require('../models');
const sidebar = require('../helpers/sidebar');
const { json } = require('express');
const controller = {};

controller.index = async (req, res) => {
    let viewModel = { image: {}, comments: {} };

    const image = await Image.findOne({filename: {$regex: req.params.image_id}});
    if(image){
        image.views = image.views + 1;
        viewModel.image = image;
        await image.save();
        
        const comments = await Comment.find({image_id: image._id});
        viewModel.comments = comments;

        viewModel = await sidebar(viewModel);

        res.render('image', viewModel);
        
        }else{
            res.redirect('/');
        }
};

controller.create = (req, res) => {
    const saveImages = async () => {

        const imageUrl = randomNumber();
        const images = await Image.find({filename: imageUrl});
        if(images.length > 0){
            saveImages();
        }else{
            const imageTempPath = req.file.path;
            const ext = path.extname(req.file.originalname).toLowerCase();
            const targetPath = path.resolve(`src/public/upload/${imageUrl}${ext}`);
            
            if(ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif'){
                await fs.rename(imageTempPath, targetPath);
                newImage = new Image({
                    title: req.body.title,
                    filename: imageUrl+ext,
                    description: req.body.description
                });
                const imageSave = await newImage.save();
                
                res.redirect('/images/' + imageUrl);
            }else {
                await fs.unlink(imageTempPath);
                res.status(500).json({error: 'Only Images are allowed'});
            }
        }
    };
    saveImages();
};

controller.like = async (req, res) => {
    const image = await Image.findOne({filename: {$regex: req.params.image_id}});
    if(image){
        image.likes = image.likes + 1;
        await image.save();
         res.json({likes: image.likes});
    }else{
        res.status(500),json({error: 'InternaL error'});
    }
}

controller.comment = async (req, res) => {
    const image = await Image.findOne({filename: {$regex: req.params.image_id}});
    if(image){
        const newComment = new Comment(req.body);
        newComment.gravatar = md5(newComment.email);
        newComment.image_id = image._id;
        newComment.save();
        res.redirect('/images/'+ image.uniqueId);
    }else{
         res.redirect('/');
    }
};

controller.delete = async (req, res) => {
    const image = await Image.findOne({filename: {$regex: req.params.image_id}});
    if(image){
        await fs.unlink(path.resolve('./src/public/upload/'+ image.filename));
        await Comment.deleteOne({image_id: image._id});
        await image.remove();
        res.json(true);
    }
    res.send('delete');
}


module.exports = controller;