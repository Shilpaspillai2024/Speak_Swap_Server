import { Router } from "express";
import GeoController from "../../controllers/geo/geoController";
import GeoService from "../../services/implementation/geo/geoService";

const router=Router()

const geoService=new GeoService()
const geoController=new GeoController(geoService)

router.get("/countries",(req,res)=>geoController.getCountries(req,res))
router.get("/languages",(req,res)=>geoController.getLanguages(req,res))

export default router;
