import operationUrl from 'app/core/utils/operationURL';

const fontSize: any = {};

fontSize.defaultValues = [
  {
    text: '55%',
    value: '55%',
    vw: '0.5vw',
    px: '10px',
  },
  {
    text: '60%',
    value: '60%',
    vw: '0.6vw',
    px: '12px',
  },
  {
    text: '65%',
    value: '65%',
    vw: '0.7vw',
    px: '14px',
  },
  {
    text: '70%',
    value: '70%',
    vw: '0.8vw',
    px: '15px',
  },
  {
    text: '80%',
    value: '80%',
    vw: '1vw',
    px: '19px',
  },
  {
    text: '90%',
    value: '90%',
    vw: '1.2vw',
    px: '23px',
  },
  {
    text: '100%',
    value: '100%',
    vw: '1.4vw',
    px: '27px',
  },
  {
    text: '110%',
    value: '110%',
    vw: '1.6vw',
    px: '31px',
  },
  {
    text: '120%',
    value: '120%',
    vw: '1.8vw',
    px: '35px',
  },
  {
    text: '130%',
    value: '130%',
    vw: '2vw',
    px: '38px',
  },
  {
    text: '140%',
    value: '140%',
    vw: '2.2vw',
    px: '42px',
  },
  {
    text: '150%',
    value: '150%',
    vw: '2.4vw',
    px: '46px',
  },
  {
    text: '160%',
    value: '160%',
    vw: '2.6vw',
    px: '50px',
  },
  {
    text: '180%',
    value: '180%',
    vw: '3vw',
    px: '58px',
  },
  {
    text: '200%',
    value: '200%',
    vw: '3.4vw',
    px: '65px',
  },
  {
    text: '220%',
    value: '220%',
    vw: '3.8vw',
    px: '73px',
  },
  {
    text: '230%',
    value: '230%',
    vw: '4vw',
    px: '77px',
  },
];

//new
fontSize.getValue = (isVw: boolean, font: string) => {
  const key = font || '70%';
  let val = "";
  for (let i = 0; i < fontSize.defaultValues.length; i++) {
    const option = fontSize.defaultValues[i];
    if (option.text === key || option.vw === key || option.px === key) {
      val = isVw ? option.vw : option.px;
      if (isVw && window.screen.width < 768) {
        val = option.value;
      }
      if (operationUrl.getUrlParame('reportExport') === 'PDF') {
        val = option.px;
      }
    }
  }
  val = val || "15px";
  return val;
};

//old
fontSize.fontSizeChange = (isVw: boolean, text: any, mobile?: any) => {
  let r: string;
  fontSize.defaultValues.forEach((val: any) => {

    if (val.text === text) {

      if (isVw) {
        r = val.vw;
      } else {
        r = val.text;
      }

      if (mobile === "mobile") {
        r = val.text;
      }

    }
  });

  return r;
};

fontSize.reportVwToPx = (vw: string) => {
  let rText = "15px";
  fontSize.defaultValues.forEach((val: any) => {
    if (val.vw === vw) {
      rText = val.px;
    }
  });
  return rText;
};

fontSize.mobileVwtoText = (vw: string) => {
  let rText = "100%";
  fontSize.defaultValues.forEach((val: any) => {
    if (val.vw === vw) {
      rText = val.text;
    }
  });
  return rText;
};

fontSize.getFontHeight = (font: any, isVw: boolean) => {
  const LINE_HEIGHT = 1.5;
  let rfont: number;
  for (let i = 0; i < fontSize.defaultValues.length; i++) {
    const option = fontSize.defaultValues[i];
    if (option.value === font) {
      if (isVw) {
        const num = parseFloat(option.vw);
        const vwTopxScale = window.innerWidth / 100;
        rfont = LINE_HEIGHT * num * vwTopxScale;
      } else {
        const num = parseFloat(option.px);
        rfont = LINE_HEIGHT * num;
      }
    }
  }

  rfont = Math.round(rfont);
  if (rfont < 19) {
    rfont = 19;
  }
  return rfont;
};

//li.na add
fontSize.getGaugeFontPx = (font: any) => {
  const unit = font.charAt(font.length - 1);
  let rfont: any;
  fontSize.defaultValues.forEach((val: any) => {
    if (unit === "w") {
      if (val.vw === font) {
        rfont = val.px;
      }
    } else if (unit === "%") {
      if (val.text === font) {
        rfont = val.px;
      }
    } else {
      rfont = val.vw;
    }
  });

  rfont = parseFloat(rfont);
  return rfont;
};
//li.na add

fontSize.upgradesFontsize = (font: any) => {
  let rfont = "70%";
  for (let i = 0; i < fontSize.defaultValues.length; i++) {
    const option = fontSize.defaultValues[i];
    if (option.px === font || option.vw === font || option.value === font) {
      rfont = option.value;
    }
  }
  return rfont;
};

fontSize.fontSizeCompatibility = (isVw: boolean, value: any) => {
  let r: "70%";
  fontSize.defaultValues.forEach((val: any) => {
    if (isVw) {
      if (val.vw === value) {
        r = val.value;
      }
    } else {
      if (val.px === value) {
        r = val.value;
      } else if (val.text === value) {
        r = val.value;
      }
    }
  });

  return r;
};

export default fontSize;
