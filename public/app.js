function getResult() {
  $(".container").empty();
  $.getJSON("/all", function(data){
    for(var i = 0; i < data.length; i++){
      console.log(data[i]);
      $(".title").append(data[i].Title);
      $(".sum").append(data[i].Summary);
      $(".URL").append(data[i].URL)
    }
  })
}

getResult();
