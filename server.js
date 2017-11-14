var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

app.use(bodyParser.urlencoded({extended:true}));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost/message_board", {useMongoClient:true});

var Schema = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
    name: {type:String, required:[true, "Please enter name!"], minlength:[4, "Name must contain at least 4 characters"]},
    message: {type:String, required: [true, "Please enter a message!"]},
    comments: [{type:Schema.Types.ObjectId, ref:"Comment"}]
}, {timestamps:true});

var CommentSchema = new mongoose.Schema({
    _message: {type:Schema.Types.ObjectId, ref:"Message"},
    name: {type:String, required:[true, "Please enter name!"], minlength:[4, "Name must contain at least 4 characters"]},
    comment: {type:String, required:[true, "Please enter a comment"]}
}, {timestamps:true});

mongoose.model("Message", MessageSchema);
mongoose.model("Comment", CommentSchema);

var Message = mongoose.model("Message");
var Comment = mongoose.model("Comment");

app.get("/", function(req, res){
    Message.find({}).populate("comments").exec(function(err, messages){
        res.render("index", {messages:messages, message_errors:{}, comment_errors:{}});
    });
});

app.post("/messages", function(req, res){
    let message = new Message({
        name: req.body.name,
        message: req.body.message
    });
    message.save(function(err){
        if(err){
            res.render("index", {message_errors:message.errors});
        } else {
            res.redirect("/");
        }
    });
});

app.post("/messages/:id", function(req, res){
    Message.findOne({_id: req.params.id}, function(err, message){
        if(err){
            res.redirect("/");
        } else {
            var comment = new Comment({
                name: req.body.name,
                comment: req.body.comment
            });
            comment._message = message._id;
            message.comments.push(comment);
            comment.save(function(err){
                message.save(function(err){
                  if(err){
                    res.render("index", {comment_errors:comment.errors});
                } else {
                    res.redirect("/");
                }  
            });
                
            });
        };
    });
});

app.listen(8000, function(){
    console.log("listening on port 8000");
});