const User = require("../models/User");
const Trip = require("../models/Trip");
const mongoose = require('mongoose')


const router = require("express").Router();


router.get("/get-all-trips", async (req,res) =>{
	let list = []
	try {
		const elements = await Trip.find({});
		// console.log('All elements:', elements);
		for(let i=0;i<(await elements).length;i++){
			id = elements[i].owner.toHexString()
			id_user =new mongoose.Types.ObjectId(id)
			find_user =await User.findById(id_user)
			
			// console.log(find_user)
		
			list.push({title: elements[i].title,listIti: elements[i].listTrip,mail:find_user.email})

			
		}
		return res.status(200).json({ success: true, data: list });
	} catch (error) {
	  console.error('Error retrieving trips:', error);
	  return res.status(500).json({ success: false, error: 'Internal server error.' });
	}

})

router.post("/create-trip", async (req, res) => {
	try {
	  console.log(req.body.listTrip)
      t=req.body.title
	  // Get the authenticated user's ID
	  const userId = req.body.user_l._id;
      const objectId = new mongoose.Types.ObjectId(userId);
	  // Create a new trip associated with the user
	  const newTrip = new Trip({
		title: t, // Extract trip details from the request body
		owner: userId,
		listTrip: req.body.listTrip
	  });
	  const existingTrip = await Trip.findOne({ title:t, owner: objectId });

	  if (existingTrip) {
		console.log("I exist")
		// If an existing trip is found, update it
		existingTrip.listTrip = req.body.listTrip;
		// Update other fields as needed
  
		await existingTrip.save();
  
		return res.status(200).json({ success: true, message: "List updated successfully." });
	  }
	  console.log("I don't exist")
	  await newTrip.save();

	  // Update the user's trips array with the reference to the newly created trip
	  await User.findByIdAndUpdate(userId, { $push: { trips: newTrip._id } });
  
	  return res.status(201).json({
		error: false,
		message: "Trip created successfully.",
		trip: newTrip,
	  });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: true, message: "Internal server error." });
	}
  });
  
  router.get("/get-trips", async (req, res) => {
    const userId = req.query.userId; // Assuming you're passing userId as a query parameter
    const objectId = new mongoose.Types.ObjectId(userId);
    const result = await Trip.find({owner: objectId})
    if(result){
        return res.status(201).json({
            error: false,
            message: "Trip list has been provided!",
            trip_list: result,
          });
    }else{
        return res.status(404).json({
            error: true,
            message: "Trip list has not been provided!",
            trip_list: {},
          });
    }
  });


  router.get("/update-title", async (req, res) => {
	try {
	  const title = req.query.title;
	  const title_new = req.query.title_new;
	  const userId = req.query.userId;
	  const objectId = new mongoose.Types.ObjectId(userId);
	  const getTrip = await Trip.findOne({ title: title, owner: objectId });
	
  
	  
  
	  if (getTrip) {
		
		const updateTrip = await Trip.findOneAndUpdate(
			getTrip._id,
		  { $set: { title: title_new } },
		  { new: true }
		);
  
		
		  return res.status(200).json({ success: true, message: "Title Changed succesfully" });
		
	  }
  
	  return res.status(500).json({ success: false, message: "Internal server error." });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ success: false, message: "Internal server error." });
	}
  });


  router.delete("/delete-trip", async (req, res) => {
	try {
	  const title = req.query.title;
	  const userId = req.query.userId;
	 
	  const objectId = new mongoose.Types.ObjectId(userId);
  
	  // Find the trip to be deleted
	  const getTrip = await Trip.findOne({ title: title, owner: objectId });
	  
	  if (!getTrip) {
		return res.status(404).json({ success: false, message: "Trip not found." });
	  }
  
	  // Delete the trip
	  const existingTrip = await Trip.findOneAndDelete({ title: title, owner: objectId });
  
	  if (existingTrip) {
		// Remove the trip ID from the user's trips array
		const updateUser = await User.findByIdAndUpdate(
		  objectId,
		  { $pull: { trips: getTrip._id } },
		  { new: true }
		);
  
		if (updateUser) {
		  return res.status(200).json({ success: true, message: "Trip deleted successfully." });
		}
	  }
  
	  return res.status(500).json({ success: false, message: "Internal server error." });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ success: false, message: "Internal server error." });
	}
  });

  module.exports = router;