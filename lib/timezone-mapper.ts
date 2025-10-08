/**
 * Timezone Mapper Utility
 * Maps US area codes to timezones for intelligent call scheduling
 */

export interface TimezoneInfo {
  timezone: string;
  offset: string;
  fullName: string;
  observesDST: boolean;
}

// Area code to timezone mapping based on US timezone data
const AREA_CODE_TIMEZONE_MAP: Record<string, TimezoneInfo> = {
  // Eastern Time (ET) - UTC-5/-4
  // New York
  "212": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "315": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "347": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "516": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "518": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "585": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "607": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "631": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "646": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "680": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "716": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "718": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "838": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "845": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "914": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "917": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "929": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "934": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Florida
  "239": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "305": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "321": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "352": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "386": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "407": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "561": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "689": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "727": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "754": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "772": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "786": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "813": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "850": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "863": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "904": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "941": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "954": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Pennsylvania
  "215": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "223": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "267": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "272": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "412": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "445": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "484": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "570": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "582": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "610": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "717": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "724": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "814": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "878": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Ohio
  "216": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "220": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "234": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "283": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "330": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "380": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "419": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "440": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "513": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "567": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "614": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "740": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "937": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // North Carolina
  "252": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "336": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "704": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "743": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "828": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "910": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "919": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "980": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "984": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Georgia
  "229": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "404": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "470": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "478": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "678": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "706": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "762": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "770": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "912": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Michigan
  "231": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "248": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "269": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "313": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "517": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "586": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "616": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "679": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "734": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "810": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "906": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "947": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "989": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Virginia
  "276": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "434": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "540": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "571": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "703": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "757": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "804": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "826": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "948": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Massachusetts
  "339": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "351": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "413": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "508": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "617": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "774": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "781": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "857": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "978": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // New Jersey
  "201": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "551": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "609": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "640": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "732": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "848": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "856": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "862": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "908": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "973": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Maryland
  "240": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "301": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "410": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "443": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "667": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Indiana (mostly ET)
  "219": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "260": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "317": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "463": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "574": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "765": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "812": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "930": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Tennessee (eastern)
  "423": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "865": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Kentucky (eastern)
  "502": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "606": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "859": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // South Carolina
  "803": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "839": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "843": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "854": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "864": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Connecticut
  "203": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "475": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "860": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "959": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Maine
  "207": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // New Hampshire
  "603": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Vermont
  "802": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Rhode Island
  "401": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // West Virginia
  "304": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  "681": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Delaware
  "302": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Washington DC
  "202": { timezone: "ET", offset: "UTC-5", fullName: "Eastern Time", observesDST: true },
  
  // Alabama (some)
  "256": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "334": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "938": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // Mississippi (some)
  "228": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "601": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "662": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "769": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // Central Time (CT) - UTC-6/-5
  // Texas
  "210": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "214": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "254": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "281": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "325": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "346": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "361": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "409": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "430": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "432": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "469": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "512": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "726": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "737": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "806": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "817": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "830": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "832": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "903": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "915": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time", observesDST: true }, // El Paso area
  "936": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "940": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "956": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "972": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "979": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // Illinois
  "217": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "224": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "309": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "312": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "331": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "447": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "618": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "630": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "708": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "773": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "779": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "815": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "847": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "872": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // Louisiana
  "225": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "318": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "337": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "504": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "985": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // Missouri
  "314": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "417": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "557": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "573": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "636": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "660": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "816": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // Tennessee (central/western)
  "615": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "629": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "731": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "901": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "931": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // Wisconsin
  "262": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "274": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "414": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "534": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "608": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "715": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "920": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // Minnesota
  "218": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "320": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "507": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "612": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "651": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "763": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "952": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // Alabama
  "205": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "251": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "659": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // Oklahoma
  "405": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "539": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "572": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "580": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "918": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // Arkansas
  "327": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "479": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "501": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "870": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // Kansas
  "316": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "620": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "785": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "913": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // Iowa
  "319": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "515": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "563": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "641": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "712": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // Nebraska (eastern)
  "402": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "531": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // Nebraska (western)
  "308": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time", observesDST: true },
  
  // North Dakota
  "701": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // South Dakota
  "605": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // Kentucky (western)
  "270": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  "364": { timezone: "CT", offset: "UTC-6", fullName: "Central Time", observesDST: true },
  
  // Mountain Time (MT) - UTC-7/-6
  // Colorado
  "303": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time", observesDST: true },
  "719": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time", observesDST: true },
  "720": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time", observesDST: true },
  "970": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time", observesDST: true },
  "983": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time", observesDST: true },
  
  // Arizona (no DST)
  "480": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time (Arizona)", observesDST: false },
  "520": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time (Arizona)", observesDST: false },
  "602": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time (Arizona)", observesDST: false },
  "623": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time (Arizona)", observesDST: false },
  "928": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time (Arizona)", observesDST: false },
  
  // New Mexico
  "505": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time", observesDST: true },
  "575": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time", observesDST: true },
  
  // Utah
  "385": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time", observesDST: true },
  "435": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time", observesDST: true },
  "801": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time", observesDST: true },
  
  // Montana
  "406": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time", observesDST: true },
  
  // Wyoming
  "307": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time", observesDST: true },
  
  // Idaho (southern)
  "208": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time", observesDST: true },
  "986": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time", observesDST: true },
  
  // Nevada (some)
  "702": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "725": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "775": { timezone: "MT", offset: "UTC-7", fullName: "Mountain Time", observesDST: true },
  
  // Pacific Time (PT) - UTC-8/-7
  // California
  "209": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "213": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "279": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "310": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "323": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "408": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "415": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "424": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "442": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "510": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "530": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "559": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "562": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "619": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "626": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "628": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "650": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "657": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "661": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "669": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "707": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "714": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "747": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "760": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "805": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "818": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "820": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "831": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "858": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "909": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "916": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "925": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "949": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "951": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  
  // Washington
  "206": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "253": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "360": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "425": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "509": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "564": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  
  // Oregon
  "458": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "503": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "541": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  "971": { timezone: "PT", offset: "UTC-8", fullName: "Pacific Time", observesDST: true },
  
  // Alaska Time (AKT) - UTC-9/-8
  "907": { timezone: "AKT", offset: "UTC-9", fullName: "Alaska Time", observesDST: true },
  
  // Hawaii-Aleutian Time (HAT) - UTC-10 (no DST)
  "808": { timezone: "HAT", offset: "UTC-10", fullName: "Hawaii-Aleutian Time", observesDST: false },
};

/**
 * Extract area code from a phone number
 */
export function extractAreaCode(phoneNumber: string): string | null {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, "");
  
  // Extract area code (first 3 digits after country code)
  // Handle both formats: +1234567890 and 2345678901
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.substring(1, 4);
  } else if (digits.length === 10) {
    return digits.substring(0, 3);
  }
  
  return null;
}

/**
 * Get timezone information from area code
 */
export function getTimezoneFromAreaCode(areaCode: string): TimezoneInfo | null {
  return AREA_CODE_TIMEZONE_MAP[areaCode] || null;
}

/**
 * Get timezone information from phone number
 */
export function getTimezoneFromPhoneNumber(phoneNumber: string): TimezoneInfo | null {
  const areaCode = extractAreaCode(phoneNumber);
  if (!areaCode) return null;
  
  return getTimezoneFromAreaCode(areaCode);
}

/**
 * Calculate timezone summary from a list of phone numbers
 */
export function calculateTimezoneSummary(phoneNumbers: string[]): Record<string, number> {
  const summary: Record<string, number> = {
    ET: 0,
    CT: 0,
    MT: 0,
    PT: 0,
    AKT: 0,
    HAT: 0,
    unknown: 0,
  };
  
  for (const phoneNumber of phoneNumbers) {
    const timezoneInfo = getTimezoneFromPhoneNumber(phoneNumber);
    if (timezoneInfo) {
      summary[timezoneInfo.timezone] = (summary[timezoneInfo.timezone] || 0) + 1;
    } else {
      summary.unknown++;
    }
  }
  
  return summary;
}

/**
 * Validate if a phone number is valid US format
 */
export function isValidUSPhoneNumber(phoneNumber: string): boolean {
  const digits = phoneNumber.replace(/\D/g, "");
  
  // Must be 10 digits (with or without country code)
  if (digits.length === 10) return true;
  if (digits.length === 11 && digits.startsWith("1")) return true;
  
  return false;
}

/**
 * Format phone number to E.164 format (+12345678901)
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "");
  
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }
  
  return phoneNumber; // Return original if invalid
}
