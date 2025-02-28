import jwt from "jsonwebtoken"
import express from "express"

const app = express();
app.use(express.json());
// app.use(cors());
const PORT=2025
const SECRET_KEY="SIDDU!@#"



app.post("/Jwt", (req, res) => {
     const allowedEmails = ["siddu@gmail.com", "siva@gmail.com"];
     const { email } = req.body;
   
     if (allowedEmails.includes(email)) {
       const data = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });
       res.json({ data });
     } else {
       res.status(401).json({ error: "Unauthorized email" });
     }
   });

   const Datas = async (req, res, next) => {
     const token = req.headers.auth;
     if (token) {
       try {
         // Pass token directly (not { token })
         const decoded = jwt.verify(token, SECRET_KEY);
         // Use assignment operator to store decoded token info (or email if that's what you want)
         req.useremail = decoded.email; // or req.useremail = decoded;
         next();
       } catch (error) {
         return res.status(401).json({ error: "Invalid token" });
       }
     } else {
       return res.status(401).json({ error: "No token provided" });
     }
   };
   

   app.get("/",Datas,(req,res)=>{
     res.json({name:"hgjffc"})
   })
   

app.listen(PORT,()=>{
     console.log("Your PORt is running under 2025")
})
