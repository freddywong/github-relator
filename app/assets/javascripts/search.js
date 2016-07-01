//Followers Search:
// 1. Search for the followers of the user.
// 2. Search the user's followers for the number of times the code appears for them
// 3. Bar chart this.

//Repos Search:
// 1. Search for all repos where the code and user appears
// 2. Search the number of times the code appears in each repo 
// 3. Return a doughnut chart

$( document ).ready(function() {

  var doughnutChart = null;
  var followerBarChart = null;
  $( "#search-button" ).click(function() {
    var searchUser;
    var searchCode;
    var repoNames = [];
    var followerNames = [];
    var followersCodeCount = {};
    var repoCodeCounts = {};
    var userCodeCount;
    var accessToken;
    
    function checkTimer() {
      var timer = document.getElementById("timer");

      if(timer.innerHTML === "1:00") {          
        startSearch();
      } else {
        document.getElementById("timer-box").style.display = "block";
        document.getElementById("search").style.visibility = "hidden";
        document.getElementById("results").style.display = "none";
      }
    }
    checkTimer();

    function countdown() {
      
      var seconds = 60;
      function tick() {
        var timer = document.getElementById("timer");
        seconds--;
        timer.innerHTML = "0:" + (seconds < 10 ? "0" : "") + String(seconds);
        if( seconds > 0 ) {
          setTimeout(tick, 1000);
        } else if(document.getElementById("timer-box").style.display === "block") {
          
          timer.innerHTML = "1:00";
          document.getElementById("timer-box").style.display = "none";
          document.getElementById("search").style.visibility = "visible";
          document.getElementById("results").style.display = "block";
          startSearch();
          
        } else {

          timer.innerHTML = "1:00";
          return;
        }
      }

      tick();
    }

    function resetGlobalValues(){
      searchUser = $("#search-user").val();
      searchCode = $("#search-code").val();
      repoNames = [];
      followerNames = [];
      followersCodeCount = {};
      repoCodeCounts = {};
      userCodeCount = null;

      if(doughnutChart != null){
        doughnutChart.destroy();
      }
      if(followerBarChart != null){
        followerBarChart.destroy();
      }
    }

    function startSearch() {
      resetGlobalValues();
      hideDoughnutChart();
      hideBarChart();
      showLoadingFollowersImage();
      showLoadingReposImage();
      $.get( "/retrieve-access-token",  function(data){
        setAccessToken(data);
      }).done(function(){
        searchInputUser();
        searchFollowers();
      });
    }
    
    function setAccessToken(data) {
      accessToken = data;
    }
    

    function searchInputUser() {
      
      $.get( "https://api.github.com/search/code?q=" + searchCode + "+user:" + searchUser + "&access_token=" + accessToken + "&per_page=100" , function( data ) {
        
        var results = data.items;

        userCodeCountConstructor(data.total_count);

        results.forEach(function(result){
          var repoName = result.repository.full_name;
          repoNamesConstructor(repoName);
        });

      }).done(function(){
        if (repoNames.length > 0) {
          repoNames = repoNames.filter( onlyUnique ); 
          searchRepos();
        }

      });

    }

    var searchRepos = function(i) {
  
      var repoCount = i || 0;
      
      if(repoCount < repoNames.length) {
        // $.get( "https://api.github.com/search/code?q=" + searchCode + "+repo:" + repoNames[repoCount] + "&access_token=" + accessToken, function(data){  
        $.get( "https://api.github.com/search/code?q=" + searchCode + "+repo:" + repoNames[repoCount] + "&access_token=" + accessToken + "&per_page=100", function(data){  
          repoCodeCountsConstructor(repoNames[repoCount], data.total_count);
          searchRepos(repoCount+1);
        });
      } else {
        createRepoChart();
      }
    }
    function searchFollowers() {
      $.get( "https://api.github.com/users/" + searchUser + "/followers?per_page=100", function( data ) {
        var results = data;
        
        results.forEach(function(result){
          var followerName = result.login;
          followerNamesConstructor(followerName);
        });
      }).done(function(){
        searchFollowersCode();
      });
    }

    function searchFollowersCode(i) {
      var followerCount = i || 0;

      if(followerCount < followerNames.length){
        $.get( "https://api.github.com/search/code?q=" + searchCode + "+user:" + followerNames[followerCount] + "&access_token=" + accessToken, function( data ) {
          followersCodeCountConstructor(followerNames[followerCount], data.total_count);
          searchFollowersCode(followerCount+1);
        }).fail(function(){
          // Fails when requests to Github API are more than 30/min
          createFollowerChart();
        });
      } else {
        createFollowerChart();
      }
      
    }

    function createFollowerChart() {
      
      var labels = [];
      var data = [];

      var sortedFollowers = getSortedKeys(followersCodeCount).slice(0,9);
      
      labels.push(searchUser);
      data.push(userCodeCount);

      sortedFollowers.forEach(function(sortedFollower){
        labels.push(sortedFollower);
        data.push(followersCodeCount[sortedFollower])
      });

      var colors = []
      $.each(data, function( index, value ) {
        if(index > 0 ){
          colors.push('#DB4437')  
        } else {
          colors.push('#B0B0B0')
        }
      });

      var chartData = {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors,
            hoverBackgroundColor: colors
          }
        ]
      };

      var ctx = document.getElementById("followerBarChart");
      followerBarChart = new Chart(ctx, {
        type: 'bar',
        data: chartData
      });

      hideLoadingFollowersImage();
      showBarChart();           
      countdown();
    }

    function followersCodeCountConstructor(followerName, totalCount) {
      followersCodeCount[followerName] = totalCount;
    }

    function followerNamesConstructor(followerName) {
      followerNames.push(followerName)
    }

    function createRepoChart(){
      animateCodeCount(userCodeCount);
      var labels = [];
      var data = [];
      for (var key in repoCodeCounts) {
        labels.push(key);
        data.push(repoCodeCounts[key]);
      }
      
  
      var colors = []
      $.each(data, function( index, value ) {
        colors.push(getRandomColor());
      });

      var chartData = {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors,
            hoverBackgroundColor: colors
          }
        ]
      };

      var ctx = document.getElementById("repoDoughnutChart");
      doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: chartData
      });  
      hideLoadingReposImage();
      showDoughnutChart();        
    }

    function getRandomColor() {
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    function repoCodeCountsConstructor(repoName, totalCount) {
      repoCodeCounts[repoName] = totalCount;
    }

    function userCodeCountConstructor(totalCount) {
      userCodeCount = totalCount;
    }

    function animateCodeCount(userCodeCount) {
      setTimeout(function(){
          odometer.innerHTML = userCodeCount;
      }, 1000);
    }

    function repoNamesConstructor(repoName) {
      repoNames.push(repoName);
    }  

    function onlyUnique(value, index, self) { 
      return self.indexOf(value) === index;
    }
    function getSortedKeys(obj) {
      var keys = []; 
      for(var key in obj) {
        keys.push(key);
      }
      return keys.sort(function(a,b){return obj[b]-obj[a]});
    }

    function showLoadingReposImage() {
      $('#loading-pie-repos').show();
    }

    function hideLoadingReposImage(){
      $('#loading-pie-repos').hide(); 
    }

    function showLoadingFollowersImage() {
      $('#loading-pie-followers').show();
    }

    function hideLoadingFollowersImage(){
      $('#loading-pie-followers').hide(); 
    }

    function showDoughnutChart() {
      $('#repoDoughnutChart').show();
    }

    function hideDoughnutChart() {
      $('#repoDoughnutChart').hide();
    }

    function showBarChart() {
      $('#followerBarChart').show();
    }

    function hideBarChart() {
      $('#followerBarChart').hide();
    }

   
  });
});