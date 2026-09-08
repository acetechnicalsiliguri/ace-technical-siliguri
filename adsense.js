/* =========================================================
   ACE TECHNICAL SILIGURI
   GOOGLE ADSENSE CONTROL

   This file is intentionally separate from index.html.

   Ads will appear ONLY when:
   1) AdSense status = approved
   2) Master Ads = ON
   3) The relevant section = ON
   4) Real Publisher ID is added
   5) Real Ad Slot ID is added

   Until then, all ad areas remain completely hidden.
========================================================= */

const ADSENSE_SUPABASE_URL =
  "https://wxzqzbifcgxxtyhmctwk.supabase.co";

const ADSENSE_SUPABASE_ANON_KEY =
  "sb_publishable_XqzuYh6HGJR5YzsJivurjQ_lnTw1k2G";

const adsenseSupabase =
  window.supabase.createClient(
    ADSENSE_SUPABASE_URL,
    ADSENSE_SUPABASE_ANON_KEY
  );


/* =========================================================
   DEFAULT SETTINGS
   SAFE MODE = ADS OFF
========================================================= */

const AD_DEFAULTS = {
  adsense_status: "disabled",

  master_ads_enabled: false,

  homepage_ads_enabled: false,

  courses_ads_enabled: false,

  gallery_ads_enabled: false,

  footer_ads_enabled: false
};


let adSettings = {
  ...AD_DEFAULTS
};


/* =========================================================
   GOOGLE ADSENSE DETAILS

   IMPORTANT:
   KEEP THESE EMPTY UNTIL GOOGLE ADSENSE APPROVES THE SITE.

   After approval:
   ADSENSE_CLIENT = your Google Publisher ID
   ADSENSE_SLOTS = your individual Ad Slot IDs
========================================================= */

const ADSENSE_CLIENT = "";


const ADSENSE_SLOTS = {

  homepage: "",

  courses: "",

  gallery: "",

  footer: ""

};


/* =========================================================
   CLEAR AD SLOT

   This makes sure nothing remains visible when ads are OFF.
========================================================= */

function clearAdSlot(element){

  if(!element){
    return;
  }

  element.innerHTML = "";

  element.classList.remove("show");

  element.setAttribute(
    "aria-hidden",
    "true"
  );

}


/* =========================================================
   LOAD GOOGLE ADSENSE SCRIPT
========================================================= */

function loadAdSenseScript(){

  if(!ADSENSE_CLIENT){

    return Promise.resolve(false);

  }


  const existing =
    document.querySelector(
      'script[data-adsense-loader="true"]'
    );


  if(existing){

    return Promise.resolve(true);

  }


  return new Promise(function(resolve){

    const script =
      document.createElement("script");


    script.async = true;


    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
      encodeURIComponent(
        ADSENSE_CLIENT
      );


    script.crossOrigin =
      "anonymous";


    script.dataset.adsenseLoader =
      "true";


    script.onload =
      function(){

        resolve(true);

      };


    script.onerror =
      function(){

        resolve(false);

      };


    document.head.appendChild(
      script
    );

  });

}


/* =========================================================
   RENDER INDIVIDUAL AD
========================================================= */

async function renderAdSlot(
  elementId,
  enabled,
  slotId
){

  const element =
    document.getElementById(
      elementId
    );


  if(!element){

    return;

  }


  /* Always clear the area first. */

  clearAdSlot(
    element
  );


  /* =======================================================
     ADS WILL NOT SHOW UNLESS ALL CONDITIONS ARE TRUE
  ======================================================= */

  if(

    adSettings.adsense_status !==
      "approved"

    ||

    adSettings.master_ads_enabled !==
      true

    ||

    enabled !== true

    ||

    !ADSENSE_CLIENT

    ||

    !slotId

  ){

    return;

  }


  /* Load Google AdSense */

  const scriptReady =
    await loadAdSenseScript();


  if(!scriptReady){

    clearAdSlot(
      element
    );

    return;

  }


  /* =======================================================
     CREATE GOOGLE ADSENSE ELEMENT
  ======================================================= */

  element.innerHTML =
    '<ins class="adsbygoogle" ' +
    'style="display:block" ' +
    'data-ad-client="' +
    ADSENSE_CLIENT +
    '" ' +
    'data-ad-slot="' +
    slotId +
    '" ' +
    'data-ad-format="auto" ' +
    'data-full-width-responsive="true">' +
    '</ins>';


  element.classList.add(
    "show"
  );


  element.setAttribute(
    "aria-hidden",
    "false"
  );


  /* =======================================================
     ASK GOOGLE TO RENDER THE AD
  ======================================================= */

  try{

    (
      window.adsbygoogle =
        window.adsbygoogle || []
    ).push({});


  }catch(error){

    console.error(
      "ADSENSE RENDER ERROR:",
      error
    );


    clearAdSlot(
      element
    );

  }

}


/* =========================================================
   LOAD ADSENSE SETTINGS FROM SUPABASE
========================================================= */

async function loadAdSenseSettings(){

  try{

    const {
      data,
      error
    } = await adsenseSupabase

      .from(
        "adsense_settings"
      )

      .select(
        "adsense_status,master_ads_enabled,homepage_ads_enabled,courses_ads_enabled,gallery_ads_enabled,footer_ads_enabled"
      )

      .eq(
        "id",
        1
      )

      .maybeSingle();


    /* =====================================================
       If settings exist, use them.
    ===================================================== */

    if(
      !error &&
      data
    ){

      adSettings = {

        ...AD_DEFAULTS,

        ...data

      };

    }

    else{

      /* Safe fallback */

      adSettings = {
        ...AD_DEFAULTS
      };

    }


  }catch(error){

    console.error(
      "ADSENSE SETTINGS LOAD ERROR:",
      error
    );


    /* =====================================================
       SAFE MODE:
       Any error means advertisements stay OFF.
    ===================================================== */

    adSettings = {
      ...AD_DEFAULTS
    };

  }


  /* =======================================================
     HOMEPAGE AD
  ======================================================= */

  await renderAdSlot(

    "homepageAdSlot",

    adSettings.homepage_ads_enabled,

    ADSENSE_SLOTS.homepage

  );


  /* =======================================================
     COURSES AD
  ======================================================= */

  await renderAdSlot(

    "coursesAdSlot",

    adSettings.courses_ads_enabled,

    ADSENSE_SLOTS.courses

  );


  /* =======================================================
     GALLERY AD
  ======================================================= */

  await renderAdSlot(

    "galleryAdSlot",

    adSettings.gallery_ads_enabled,

    ADSENSE_SLOTS.gallery

  );


  /* =======================================================
     FOOTER AD
  ======================================================= */

  await renderAdSlot(

    "footerAdSlot",

    adSettings.footer_ads_enabled,

    ADSENSE_SLOTS.footer

  );

}


/* =========================================================
   START ADSENSE SYSTEM
========================================================= */

loadAdSenseSettings();
