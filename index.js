const express = require('express')
const app = express()
const port = process.env.PORT || 1234;
require('dotenv').config()

const cors = require('cors')
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.get('/', (req, res) => {
    res.send('Hello World!')
})


const uri = process.env.MONGO_DB_URI;
const client = new MongoClient(uri, {
    serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
       const database = client.db("hireloop");
    const jobsCollection = database.collection("jobs");
    const companyCollection = database.collection('companies')
    const applicationCollection = database.collection('applications')
    const planCollection = database.collection('plans')
    const subcribstionCollection = database.collection('subcribetion')
        const usersCollection = database.collection("user");


// jobs api //////////////////////////////////////////

app.get('/api/jobs', async(req, res)=>{
    const query ={};
    if(req.query.companyId){
        query.companyId=req.query.companyId;
    }
    if(req.query.status){
        query.status=req.query.status;
    }
    const cursor = jobsCollection.find(query);
    const result = await cursor.toArray();
    res.send(result)
})


 app.get('/api/jobs/:id', async(req, res)=>{

        const id = req.params.id;
        const query = {
          _id : new ObjectId(id)
        };

        const result = await jobsCollection.findOne(query);

        res.send(result)
 })

  app.post('/api/jobs', async(req, res)=>{
    const job = req.body;
    const newJob = {
      ...job,
      createdAt : new Date()
    }
    const result = await jobsCollection.insertOne(newJob)
    res.send(result)
  })



  // application api     ////////////////////////////


  // app.get('/api/applications' , async(req, res)=>{
  //   const query = {};

  //   if(req.query.applicantId){
  //     query.applicantId = req.query.applicantId
  //   }
    
  //   if(req.query.jobId){
  //     query.jobId = req.query.jobId
  //   }

  //   const result= await applicationCollection.find(query).toArray();
  //   res.send(result)

  // })



  app.get('/api/applications', async (req, res) => {
  const { applicantId, jobId } = req.query;

  const condition = {};

  if (applicantId) condition.applicantId = applicantId;
  if (jobId) condition.jobId = jobId;

  const result = await applicationCollection.find(condition).toArray();
  res.send(result);
});





  app.post('/api/applications', async(req, res)=>{
    const application = req.body;
    const newApplication = {
      ...application,
            createdAt : new Date()
           }
    const result = await applicationCollection.insertOne(newApplication);
    res.send(result)
  })



  // plans api  iiiiiiiiiiiiiiiii /////////////

  app.get('/api/plans', async(req, res)=>{
    const condition = {}
    if(req.query.plan_id){
      condition.id= req.query.plan_id
    }

    const plan = await planCollection.findOne(condition);
    res.send(plan)
  })

  // subcribetion api ///////////

  app.post('/api/subcribtion' , async(req, res)=>{
    const data = req.body
    const subsInfo = {
      ...data,
            createdAt : new Date()
    }
    const result = await subcribstionCollection.insertOne(subsInfo)


    const filter = {email:data.email}

    const updateDocument ={
      $set: {
  plan: data.planId // বা ফ্রন্টএন্ড অনুযায়ী সঠিক স্পেলিং
}
    }
   
     const updateDocumentResult = await usersCollection.updateOne(filter,updateDocument)

     

    res.send(updateDocumentResult)
  })



// // subscription api ///////////
// app.post('/api/subcribtion', async (req, res) => {
//   try {
//     const data = req.body;
    
//     const subsInfo = {
//       ...data,
//       createdAt: new Date()
//     };
//     const result = await subcribstionCollection.insertOne(subsInfo);

//     const filter = { email: data.email };

//     const updateDocument = {
//       $set: {
//         plan: data.planId 
//       },
//     };

//     const updateDocumentResult = await usersCollection.updateOne(filter, updateDocument);

//     res.send({
//       success: true,
//       subscriptionId: result.insertedId,
//       userUpdate: updateDocumentResult
//     });

//   } catch (error) {
//     console.error("Subscription Error:", error);
//     res.status(500).send({ error: "Something went wrong" });
//   }
// });


// ff ////




    // company releted api ////////////////////////////

    app.post('/api/companies', async(req, res)=>{
      const company = req.body;
      const newCompany = {
        ...company,
        createdAt : new Date()
      }
      const result = await companyCollection.insertOne(company);
      res.send(result)
    })

    app.get('/api/companies', async(req, res)=>{
      const cursor = companyCollection.find();

      const result = await cursor.toArray();

      res.send(result)
    })


    

   app.get('/api/my/companies', async (req, res) => {
            const query = {};
            if (req.query.recruiterId) {
                query.recruiterId = req.query.recruiterId;
            }
            const result = await companyCollection.findOne(query);

            res.send(result || {});
        })




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}


run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})