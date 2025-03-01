interface IGeoService {
    getCountries(): Promise<any>;
  
    getLanguages(): Promise<any>;
  }
  
  export default IGeoService;
  