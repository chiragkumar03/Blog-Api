const mongo_url = "mongodb+srv://chirag2193:XSMVlYcbzUC5rdKj@cluster0.pdxlo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")
const express = require("express")
const blog = require("./Blog_Model")
const user = require("./Author_Model")
const jwt = require("jsonwebtoken")
app = express()
const port = 4000
const secret_key = "Chirag@2134"

app.use(express.json());
app.use(express.urlencoded({extended : true}))

mongoose.connect(mongo_url)
.then(()=>console.log("Connected to mongoDB"))
.catch((error)=>console.log("Failed to connect to mongoDB:" , error));

app.get("/" , (req , res)=>{
    res.send("Server is successfully running.");
})

//Route for creating signup page -> post method
app.post("/signup" , async(req , res)=>{
    const {name , email , password} = req.body;
    if(!name || !email || !password){
        return res.send("Pease fill the required fields.");
    }
    
    // password = hashedPassword
    
    // if(email){
    //     res.send("User with this email already exists in the database.")
    // }
    try {
        const existingUser = await user.findOne({email});
        if(existingUser){
            return res.send("User with this email already exists in the database.")
        }
        
        const saltRounds = 8;
        const hashedPassword = await bcrypt.hash(password , saltRounds);
        const newUser = new user ({
            name , email , password:hashedPassword
        })
        const token = jwt.sign({name : newUser.name , email: newUser.email} , 
            secret_key , {expiresIn : "1d"})

        await newUser.save();
        res.send({message:
            "User is registered sucessfully." 
            , token});
        console.log(newUser);
        console.log(token)
    } 
    catch (error) {
        res.send("Error in registering:" , error)
    }
})

//Route for login -> post method
app.post("/login" , async(req , res)=>{
    const {email , password} = req.body;

    if(!email || !password){
        return res.send("Login credentials are missing.");
    }
    
    try {
        const existingUser = await user.findOne({email});
        if(!existingUser){
            return res.send("User is not registered with the given email.")
        }
        const isCorrect = await bcrypt.compare(password , existingUser.password);

        if(isCorrect){
            // console.log("Sucessfully logged in :",{email , password});
            // return res.send("Login successfull.")
            const token = jwt.sign(
                { id: existingUser._id, email: existingUser.email },
                "yourSecretKey", // Replace with an environment variable for production
                { expiresIn: "1h" } // Token expires in 1 hour
            );

            console.log("Successfully logged in:", { email });
            return res.json({ message: "Login successful.", token });

            
        }
        else{
            return res.send("Incorrect password.")
        }
    } 
    catch (error) {
        res.send("Error in login:" , error);
    }
})

//First Route of creating a new blog -> post method
app.post("/createBlog" , async(req , res)=>{
    const {title , author , content} = req.body;
    if(!title || !author || !content){
        res.send("Please fill the require fields.");
    }

    try {
       const newPost = new blog({
            title , author , content
        })
        await newPost.save();
        res.send("Blog is created succesfully.");
        console.log(newPost)
    } 
    catch (error) {
        res.send("Failed to create the blog.")
    }
})

//Second route of getting all the blog posts -> get method
app.get("/getAllBlogs" , async(req , res)=>{
    try {
        const data = await blog.find();
        const result = res.json(data)
        console.log(data)
        
    } catch (error) {
        res.send("Error in fetching the data.")
    }
})

// Third route of getting single blog post -> get method
app.get("/singleBlog/:id" , async(req , res)=>{
    const {id} = req.params;

    try {
        const existingData = await blog.findById(id);
        if(existingData){
            return res.json(existingData);
            console.log(existingData)
        }
        else{
            return res.send("Blog not found.")
        }
    
    } 
    catch (error) {
        console.log("Error in fetching the blog:" , error);
        res.send("Error in fetching the blog.")
    }

})

//Fourth route of deleting a blog post -> delete method
app.delete("/deleteBlog/:id" ,async (req , res)=>{
    const {id} = req.params;

    try {
        const deletedBlog = await blog.findByIdAndDelete(id);
        
        if(!deletedBlog){
            return res.send("Blog not found");

        }
        res.send("Blog deleted successfully.")
        
    } catch (error) {
        res.send("Error occurred while deleting the blog.")
    }
})

//Fifth route of updating a blog post -> put method
app.put("/updateBlog/:id" , async(req , res)=>{
    const {id} = req.params;
    const updatedData = req.body;

    try {
        const existingData = await blog.findById(id);
        if(!existingData){
            return res.send("Blog not found.");
        }
        const updatedBlog = await blog.findByIdAndUpdate(id , updatedData , {new : true});
        res.send("Blog is updated.");
        console.log(updatedBlog)
        
    } catch (error) {
        res.send("Error in updating the blog:" , error);
    }
})

//Sixth route of getting posts filtered title by author
app.get("/getBlog" , async(req , res)=>{
    const {title , author} = req.query;

    const jsonObject = {};
    if(title) jsonObject.title = title
    if(author) jsonObject.author = author

    try {
        const getData = await blog.find(jsonObject);
        if(!getData.length){
            return res.send("No data found.");
        }
        res.json(getData);
        console.log(getData)
        
    } catch (error) {
        return res.send("Error in fetching the data:",error);
    }
})

app.listen(port , ()=>{
    console.log(`Server is running on port number ${port}`);
})

