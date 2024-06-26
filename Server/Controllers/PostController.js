import postmodel from "../Models/postmodel.js";
import mongoose from "mongoose";
import userModel from '../Models/userModel.js'


//create new post
export const createPost = async(req,res)=> {
    const newPost = new postmodel(req.body)

    try{
        await newPost.save();
        res.status(200).json(newPost);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const getPost= async(req,res)=> {
    const id = req.params.id

    try{
        const post = await postmodel.findById(id)
        res.status(200).json(post)

    } catch (error) {
        res.status(500).json(error)

    }
};

//update a post
export const updatePost = async(req,res) => {
    const postId = req.params.id
    const {userId} = req.body

    try{
        const post = await postmodel.findById(postId)
        if(post.userId === userId)
        {
            await post.updateOne({$set : req.body})
            res.status(200).json("Post Update")
        }
        else{
            res.status(403).json("Action Forbidden")
        }
        
    } catch (error) {
        res.status(500).json(error)

    }
};

// Delete a post
export const deletePost = async (req, res) => {
    const id = req.params.id;
    const { userId } = req.body;
  
    try {
      const post = await postmodel.findById(id);
      if (post.userId === userId) {
        await post.deleteOne();
        res.status(200).json("POst deleted successfully");
      } else {
        res.status(403).json("Action forbidden");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  };

  //like/dislike post
  export const likePost = async (req, res) => {
    const id = req.params.id;
    const { userId } = req.body;
  
    try {
      const post = await postmodel.findById(id);
      if (!post.likes.includes(userId)) {
        await post.updateOne({ $push: { likes: userId } });
        res.status(200).json("Post liked");
      } else {
        await post.updateOne({ $pull: { likes: userId } });
        res.status(200).json("Post Unliked");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  };

  //add comment to a post
  export const addCommentToPost = async (req, res) => {
    const postId = req.body.postId;
    const comment = {
      userName: req.body.user,
      comment: req.body.comment
    };

    try{
      const post = await postmodel.findById(postId);
      console.log(post)
      await postmodel.updateOne({_id: post._id}, {$push: {comments: comment}});
      res.status(200).json("Comment added to the post successfully");
    } catch (error) {
      res.status(500).json(error);
    }
  }

  //Get Timeline Posts
  export const getTimelinePosts = async(req,res)=> {
    const userId = req.params.id;
    try{
        const currentUserPosts = await postmodel.find({userId : userId})
        const followingPosts = await userModel.aggregate([
          {
            $match: {
              _id : new mongoose.Types.ObjectId(userId)
            },
          },
          {
            $lookup: {
              from : "posts",
              localField: "following",
              foreignField: "userId",
              as: "followingPosts"
            },
          },
          {
            $project: {
              followingPosts: 1,
              _id: 0
            },
          },
        ]);
        res.status(200).json(currentUserPosts.concat(...followingPosts[0].followingPosts)
        .sort((a,b)=>{
            return new Date(b.createdAt) - new Date(a.createdAt);
        })
        );
    } catch (error) {
      res.status(500).json(error)
    }
  }