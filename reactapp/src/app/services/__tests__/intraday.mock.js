(function () {


  var intraday = [
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 1, 10), stockId: "BBAS3",
      max: 80,
      min: 60,
      open: 70,
      close: 50,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 2, 10), stockId: "BBAS3",
      max: 60,
      min: 20,
      open: 55,
      close: 25,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 3, 10), stockId: "BBAS3",
      max: 55,
      min: 20,
      open: 25,
      close: 45,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 4, 10), stockId: "BBAS3",
      max: 100,
      min: 60,
      open: 65,
      close: 90,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 5, 10), stockId: "BBAS3",
      max: 110,
      min: 80,
      open: 100,
      close: 75,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 6, 10), stockId: "BBAS3",
      max: 80,
      min: 65,
      open: 75,
      close: 70,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 7, 10), stockId: "BBAS3",
      max: 75,
      min: 50,
      open: 70,
      close: 60,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 8, 10), stockId: "BBAS3",
      max: 74,
      min: 45,
      open: 65,
      close: 70,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 9, 10), stockId: "BBAS3",
      max: 110,
      min: 65,
      open: 70,
      close: 80,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 10, 10), stockId: "BBAS3",
      max: 160,
      min: 70,
      open: 80,
      close: 150,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 11, 10), stockId: "BBAS3",
      max: 150,
      min: 120,
      open: 140,
      close: 145,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 12, 10), stockId: "BBAS3",
      max: 160,
      min: 100,
      open: 150,
      close: 110,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 13, 10), stockId: "BBAS3",
      max: 170,
      min: 110,
      open: 120,
      close: 160,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 14, 10), stockId: "BBAS3",
      max: 180,
      min: 130,
      open: 150,
      close: 170,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 15, 10), stockId: "BBAS3",
      max: 190,
      min: 155,
      open: 160,
      close: 180,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 16, 10), stockId: "BBAS3",
      max: 180,
      min: 150,
      open: 150,
      close: 170,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 17, 10), stockId: "BBAS3",
      max: 180,
      min: 150,
      open: 170,
      close: 150,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 18, 10), stockId: "BBAS3",
      max: 160,
      min: 100,
      open: 150,
      close: 120,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 19, 10), stockId: "BBAS3",
      max: 190,
      min: 110,
      open: 120,
      close: 160,
    },
    {
      adjustedClose: 1, id: 1, volume: 10000, date: new Date(2023, 20, 10), stockId: "BBAS3",
      max: 210,
      min: 150,
      open: 160,
      close: 170,
    },
  ];


  if (typeof (global) !== 'undefined')
    global.intraday = intraday
  else
    window.intraday = intraday
})()