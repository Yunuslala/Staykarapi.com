const AsyncerrorHandler = require("../middlewares/AsyncerrorHandler");
const { HotelModel } = require("../models/Hotel.model");
const { OfferModel } = require("../models/Offer.model");
const { ErrorHandler } = require("../utils/Error.Handler");
const { generateRandomString, generateRandomNumber } = require("../utils/RandomNumber");



exports.AddOffer=AsyncerrorHandler(async(req,res,next)=>{
   const {role,UserId,discount}=req.body;
   if(role!="admin"){
    return next(new ErrorHandler(401,"you are not authorized for this route"));
 }
  const CuponId=generateRandomNumber(3);
  const Cupon=`PAYNOWOFF${CuponId}`

   const createOffer=new OfferModel({discount,CuponId:Cupon});
   await createOffer.save();
   return res.status(200).send({success:true,msg:"Offers added",data:createOffer})
})

exports.UpdateOffers=AsyncerrorHandler(async(req,res,next)=>{
    const {role,OfferId,discount}=req.body;
   const findOffer=await OfferModel.findOne({_id:OfferId});
   if(!findOffer){
    return next(new ErrorHandler(404,"Invalid OfferId"))
   }else if(role!=="admin"){
    return next(new ErrorHandler(401,"You are not authorised to update this blog"))
   }
    const updateOffer=await OfferModel.findByIdAndUpdate({_id:OfferId},{
     discount:discount?discount:findOffer.discount
    },{new:true})
    return res.status(201).send({success:true,msg:"Offer is updated",data:updateOffer})
 })


exports.DeleteOffers=AsyncerrorHandler(async(req,res,next)=>{
  const {role}=req.body;
  const findOffer=await OfferModel.findOne({_id:req.params.id});
 if(!findOffer){
  return next(new ErrorHandler(404,"Invalid OfferId"))
 }
 if(role!="admin" ){
    return next(new ErrorHandler(401,"you are not authorized for this route"));
 }
 if(findOffer.HotelId){
    const removeFromHotel=await HotelModel.findOne({_id:findOffer.HotelId});
    if(!removeFromHotel){
       return next(new ErrorHandler(404,"invalid Hotelid does not exist"))
    }else{
        await HotelModel.findByIdAndUpdate({_id:findOffer.HotelId},{
            $pull:{
                offers:{
                    OfferId:req.params.id
                }
            }
        })
    }
 }

  const updateOffer=await OfferModel.findByIdAndDelete({_id:OfferId},{new:true})
  return res.status(201).send({success:true,msg:"Offer is deleted",data:updateOffer})
})
exports.AssignToHotels = AsyncerrorHandler(async (req, res, next) => {
    const { offersId, HotelId, role } = req.body;
    if (role !== "admin") {
        return next(new ErrorHandler(401, "You are not authorized for admin routes"));
    }
    const findHotel = await HotelModel.findOne({ _id: HotelId });
    if (!findHotel) {
        return next(new ErrorHandler(404, 'Invalid HotelId'));
    }
    
    try {
        for (const item of offersId) {
            await HotelModel.findByIdAndUpdate({ _id: HotelId }, {
                $push: {
                    offers: {
                        offerId: item
                    }
                }
            }, { new: true });
            await OfferModel.findByIdAndUpdate({ _id: item }, {
                $push: {
                    Hotel: {
                        HotelId
                    }
                }
            }, { new: true });
        }
       return res.status(200).json({ success: true, message: "Offers assigned to hotels successfully" });
    } catch (error) {
        return next(new ErrorHandler(500, "Internal Server Error"));
    }
});

exports.GetOffersOfHotel=AsyncerrorHandler(async(req,res,next)=>{
    const hotelId=req.params.id
    const findOffer=await OfferModel.find({'Hotel.HotelId':hotelId}).populate('Hotel.HotelId');
    if(!findOffer.length){
     return next(new ErrorHandler(404,"Offer is empty does not exist"))
    }
     return res.status(201).send({success:true,msg:"All Offers of Hotel",data:findOffer})
   })

exports.AllOffers=AsyncerrorHandler(async(req,res,next)=>{

    const findAll=await OfferModel.find();
    return res.status(200).send({success:true,msg:"All offers",data:findAll})
})