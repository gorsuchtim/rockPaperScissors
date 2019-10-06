$(document).ready(function() {
  // Project Goal: Create an intuitive user experience using predictive modeling/statistics to produce information and react based on the user's historical and trending behaviors
  // Application: Rock paper scissors game

  // Process:
  // Round 1: Pre-selection: with no existing previous rounds (therefore no reactive behavior from the user), both decisions (user and program) are random
  // Round 1: Post-selection: Program: log round 1 choice in var cm1
  // Round 1: Post-selection: Program: logs its selection for round 1 in var cm1
  // Round 2+: Pre-selection: User: may base decision on what the program chose in previous round
  // Round 2: Pre-selection: Program: because user's choice in round 1 was random, program cannot base its round 2 decision in data.  Program makes random selection
  // Round 2: Post-selection: Program: categorically log userResponse in contrast to cm1 (previous round's program choice).
  // Round 2+: Post-Selection: Example: if previous round's choice was rock and in round 2 user chose paper then categorically log this data by increasing var rp (rock|paper) by 1
  // Round 3+: Pre-selection: Program: using categorical data, determine (via cm1) what program chose last round (ex: did program choose rock, paper, or scissors last round)
  // Round 3+: Pre-selection: Continued: Review each object within that category (rock|paper, rock|scissors, rock|rock) to find highest value
  // Highest value is indicitive of user's highest historical tendency choice when the program, in the previous round, chooses that category (rock in this example)    //
  // Program then bases it's decision on which choice (rock, paper, scissors) will win over the choice the user is most likely to make
  // As more turns are taken and data set grows, the program is able to "adjust" its behavior to match the user's behavior changes

  // Because historical data may fall behind by multiple rounds (ie it may take 3 rounds for historical data to show that user is trending toward a different category)
  // Function checkTrend() identifies trending behavior: if a user has selected any one choice consecutively it is logged.
  // When 3 consecutive choices are logged the program can override the choice-by-history behavior to avoid muliple losses and make its choice based on user's trending behavior

  var compChoice,
    userResponse,
    result,
    cm1,
    dynamicCategory,
    roundCount = 0,
    largestTendency,
    rockTrend = 0,
    paperTrend = 0,
    scissorsTrend = 0,
    lastrockCatChanged,
    lastpaperCatChanged,
    lastscissorsCatChanged,
    tendencyCats = {
      rockCat: [
        {
          name: "rr", // rr = when seeing rock on previous round / user chose rock on subsequent round
          value: 0
        },
        {
          name: "rp", // rp = when seeing rock on previous round / user chose paper on subsequent round
          value: 0
        },
        {
          name: "rs", // rs = when seeing rock on previous round / user chose scissors on subsequent round
          value: 0
        }
      ],
      paperCat: [
        {
          name: "pr", //pr = when seeing paper on previous round / user chose rock on subsequent round
          value: 0
        },
        {
          name: "pp", // pp = when seeing paper on previous round / user chose paper on subsequent round
          value: 0
        },
        {
          name: "ps", // ps = when seeing paper on previous round / user chose scissors on subsequent round
          value: 0
        }
      ],
      scissorsCat: [
        {
          name: "sr", // sr = when seeing scissors on previous round / user chose rock on subsequent round
          value: 0
        },
        {
          name: "sp", // sp = when seeing scissors on previous round / user chose paper on subsequent round
          value: 0
        },
        {
          name: "ss", // ss = when seeing scissors on previous round / user chose scissors on subsequent round
          value: 0
        }
      ]
    };
  var rps__round = $(".rps__round"); // identify round element
  var round = 1; // set to numerical value
  $(rps__round).text(round); // set element content to round number

  var tutorialOn; // define flag for tutorial on/off
  tutorialCard = 1; // and set the card number to 1

  var card = 0;
  $(".welcomeCard__button").click(function() {
    // on clicking through introCard tutorial
    card++; // increase card as counter to determine which text shows on screen
    switch (card) {
      case 1:
        $(".welcomeCard__text").text(
          "The program reviews your previous turns and compares them against behavior trends..."
        );
        break;
      case 2:
        $(".welcomeCard__text").text(
          "...and leverages that data to determine its next best move to win"
        );
        $(this)
          .addClass("highlightContinue")
          .text("See how it works");
        $(this).css("color", "rgba(80,80,80,0.8)");
        break;
      case 3: // on clicking Play game
        tutorialOn = true;
        sequenceFade(".userOption h3", "highlightUserAnswer", 100, "add");
        closeWelcomeCard(); // fade out the welcome card
        break;
    }
  });

  function closeWelcomeCard() {
    $(".rps__welcomeCard").fadeOut();
    card = 0;
    setTimeout(function() {
      // reset tutorial card to first card after 1s so it is after container fades out
      $(".welcomeCard__text").text(
        "A program that records and adapts to data."
      ); // reset text for the welcomeCard
      $(".welcomeCard__button--next")
        .css("background-color", "transparent")
        .text("Next"); // reset Next button text for welcomeCard
      $(".welcomeCard__button--next").css("color", "rgba(80,80,80,0.8)"); // reset Next button colors for welcomeCard
    }, 1000);
  }

  $(".userOption").click(function(e) {
    userResponse = e.currentTarget.id;
    if ($(".rps__selected").length === 0) {
      $(this)
        .children()
        .addClass("rps__selected");
      $("#compSays").addClass("rps__selected");
      roundCount++; // increase round count
      cm1 = compChoice; // but set cm1 now so we retain what the comp chose last round, what is still stored as compChoice before the new choice is made for this round
      if (roundCount < 2) {
        // if this is the first round or second round
        randomComp(); // randomly throw r|p|s
      } else {
        // if this is round 3 or beyond then we can start using collected reactionary data
        setTendencies();
      }
    }

    if (tutorialCard === 1) {
      changeTutorialCard(2);
    } else if (tutorialCard === 4) {
      changeTutorialCard(5);
    } else if (tutorialCard === 6) {
      changeTutorialCard(7);
    } else if (tutorialCard === 8) {
      changeTutorialCard(9);
    } else if (tutorialCard === 10) {
      changeTutorialCard(11);
    } else if (tutorialCard === 12) {
      changeTutorialCard(13);
    }
  });

  function sequenceFade(element, className, speed, directive) {
    var totalElements = $(element).length;
    var removeTiming = speed * totalElements;
    if (directive === "add") {
      $(element).each(function(i) {
        setTimeout(function() {
          $(element)
            .eq(i)
            .addClass(className);
        }, speed * (i + 1));
      });
      setTimeout(function() {
        $(element).each(function(i) {
          setTimeout(function() {
            $(element)
              .eq(i)
              .removeClass(className);
          }, speed * (i + 1));
        });
      }, removeTiming);
      console.log(removeTiming);
    } else if (directive === "remove") {
      $(element).each(function(i) {
        setTimeout(function() {
          $(element)
            .eq(i)
            .removeClass(className);
        }, speed * (i + 1));
      });
    } else {
      return false;
    }
  }

  $(".continueWalkthrough").click(function() {
    if (tutorialCard === 2) {
      changeTutorialCard(3);
    } else if (tutorialCard === 3) {
      $(this).removeClass("highlightContinue pulse");
      sequenceFade(".userOption h3", "highlightUserAnswer", 100, "add");
      setupNextRound();
      changeTutorialCard(4);
    } else if (tutorialCard === 5) {
      sequenceFade(".userOption h3", "highlightUserAnswer", 100, "add");
      $(this).removeClass("highlightContinue pulse");
      setupNextRound();
      changeTutorialCard(6);
    } else if (tutorialCard === 7) {
      sequenceFade(".userOption h3", "highlightUserAnswer", 100, "add");
      $(this).removeClass("highlightContinue pulse");
      setupNextRound();
      changeTutorialCard(8);
    } else if (tutorialCard === 9) {
      sequenceFade(".userOption h3", "highlightUserAnswer", 100, "add");
      $(this).removeClass("highlightContinue pulse");
      setupNextRound();
      changeTutorialCard(10);
    } else if (tutorialCard === 11) {
      sequenceFade(".userOption h3", "highlightUserAnswer", 100, "add");
      $(this).removeClass("highlightContinue pulse");
      setupNextRound();
      changeTutorialCard(12);
    } else if (tutorialCard === 13) {
      $(".continueWalkthrough")
        .removeClass("continueWalkthrough")
        .addClass("portfolio__control--projects")
        .text("Return to projects page");
      $(".closeWalkthrough").addClass("highlightContinue pulse");
      changeTutorialCard(14);
    }
  });

  function changeTutorialCard(card) {
    var userChoice = userResponse.substring(4);
    var round1Result;
    switch (card) {
      case 2:
        tutorialCard = 2;
        if (result === "Tie") {
          round1Result = "a tie";
        } else if (result === "user wins") {
          round1Result = "you won this round";
        } else if (result === "Program wins") {
          round1Result = "the program wins this round";
        }
        $(".tooltip__text").html(
          "Looks like " + round1Result + ".  Click Continue below to advance."
        );
        $(".continueWalkthrough").addClass("highlightContinue pulse");
        break;
      case 3:
        tutorialCard = 3;
        $(".tooltip__text").html(
          "Since no data is available, the program randomly chose " +
            compChoice +
            ".  Click Continue to advance."
        );
        break;
      case 4:
        tutorialCard = 4;
        $(".tooltip__text").html("Select Rock, Paper, or Scissors.");
        break;
      case 5:
        tutorialCard = 5;
        $("#displayStats").addClass("highlightContinue pulse");
        $(".tooltip__text").html(
          "Though perhaps random, your choice of " +
            userChoice +
            " is logged as a reaction.  Select Statistics to view the data."
        );
        break;
      case 6:
        tutorialCard = 6;
        $(".tooltip__text").html("Select Rock, Paper, or Scissors.");
        break;
      case 7:
        tutorialCard = 7;
        $(".continueWalkthrough").addClass("highlightContinue pulse");
        $(".tooltip__text").html(
          "Last round the program chose " +
            cm1 +
            ".  It is storing your choice of " +
            userChoice +
            " against " +
            cm1 +
            " to predict your next move."
        );
        break;
      case 8:
        tutorialCard = 8;
        $(".tooltip__text").html(
          "If you are most likely to select Paper after seeing Rock, the program chooses Scissors.  Select Rock, Paper, or Scissors."
        );
        break;
      case 9:
        tutorialCard = 9;
        $(".continueWalkthrough").addClass("highlightContinue pulse");
        $(".tooltip__text").html(
          "The program also watches for trends.  If your response to Paper has been Rock at least 3x in a row, Rock is set as a trend."
        );
        break;
      case 10:
        tutorialCard = 10;
        $(".tooltip__text").html(
          "If the program finds a trend it ignores stored data and strategizes in line with the trend.  Select Rock, Paper, or Scissors."
        );
        break;
      case 11:
        tutorialCard = 11;
        $(".continueWalkthrough").addClass("highlightContinue pulse");
        $(".tooltip__text").html(
          "Note the program choice of " +
            compChoice +
            " in response to your choice of " +
            userChoice +
            "."
        );
        break;
      case 12:
        tutorialCard = 12;
        $(".tooltip__text").html(
          "Select Rock, Paper, or Scissors to play the final round of the walkthrough"
        );
        break;
      case 13:
        tutorialCard = 13;
        var historicalTendency;
        switch (largestTendency) {
          case "r":
            historicalTendency = "Rock";
            break;
          case "p":
            historicalTendency = "Paper";
            break;
          case "s":
            historicalTendency = "Scissors";
            break;
        }
        $(".continueWalkthrough").addClass("highlightContinue pulse");
        $(".tooltip__text").html(
          "The program chose " +
            compChoice +
            ".  In the last round you saw " +
            cm1 +
            " and your next choice has usually been " +
            historicalTendency +
            "."
        );
        break;
      case 14:
        tutorialCard = 14;
        $(".tooltip__text").html(
          "This is a simple but interesting demo of how we can leverage growing data with trends to create more fluid or direct user experiences."
        );
        break;
        $(".returnToProjects").fadeIn();
    }
  }

  $("#displayStats").click(function() {
    // clicking display stats, fade in data container
    if ($(this).hasClass("highlightContinue")) {
      if (tutorialCard === 5) {
        $(this).removeClass("highlightContinue pulse");
      }
    }
    $(".dataContainer").fadeIn(250);
  });

  $(".closeDataContainer").click(function() {
    // close data container
    $(".dataContainer").fadeOut(250);
    if (tutorialOn) {
      if (tutorialCard === 5) {
        $(".continueWalkthrough").addClass("highlightContinue pulse");
      }
    }
  });

  function setupNextRound() {
    round++; // increase Round value
    $(rps__round).text(round); // set element content to round number
    $(".option")
      .children()
      .removeClass("rps__selected win lose tie"); // reset border colors and remove selected
  }

  function randomComp() {
    var randomChoice = parseInt(Math.floor(Math.random() * (3 - 1 + 1)) + 1); // randomly select a number 1, 2, or 3
    if (randomChoice === 1) {
      compChoice = "Rock"; // assign Rock value of 1
    } else if (randomChoice === 2) {
      compChoice = "Paper"; // assign Paper value of 2
    } else if (randomChoice === 3) {
      compChoice = "Scissors"; // assign Scissors value of 3
    }
    $("#comp" + compChoice + "")
      .children()
      .addClass("rps__selected"); // dynamically set computer choice text based on compchoice
    seeWhoWon();
  }

  function setTendencies() {
    dynamicCategory = cm1.charAt(0).toLowerCase() + cm1.slice(1) + "Cat"; // get cm1 and change from ex: Rock to rockCat
    var objProp = 0; // objProp represents the array index of the objects Xr is always at index 0, Xp is always at 1 and Xs is always at index 2

    if (userResponse === "userRock") {
      objProp = 0;
    } else if (userResponse === "userPaper") {
      objProp = 1;
    } else if (userResponse === "userScissors") {
      objProp = 2;
    }
    tendencyCats[dynamicCategory][objProp].value++; // ex tendencyCats[rockCat][0].value++ would increase rr by 1
    $("." + tendencyCats[dynamicCategory][objProp].name + "").text(
      tendencyCats[dynamicCategory][objProp].value
    );

    checkTrend(tendencyCats[dynamicCategory][objProp].name);
  }

  function checkTrend(cat) {
    // make this more dynamic - see above
    var temp = [];
    var trend;
    switch (dynamicCategory) {
      case "rockCat":
        if (cat === lastrockCatChanged) {
          // see if the current object (rr|rp|rs) value that was changed matches the one changed last round
          rockTrend++; // if it does, then increase trend by 1
        } else {
          rockTrend = 0; // if it doesn't then set trend to 0 to avoid a false flag trend
        }
        lastrockCatChanged = cat; // now that the test is over, set lastrockCatChanged to cat so next round when we go back up to the condition it equals this round's changed value
        break;
      case "paperCat":
        if (cat === lastpaperCatChanged) {
          // see if the current object (rr|rp|rs) value that was changed matches the one changed last round
          paperTrend++; // if it does, then increase trend by 1
        } else {
          paperTrend = 0; // if it doesn't then set trend to 0 to avoid a false flag trend
        }
        lastpaperCatChanged = cat; // now that the test is over, set lastrockCatChanged to cat so next round when we go back up to the condition it equals this round's changed value
        break;
      case "scissorsCat":
        if (cat === lastscissorsCatChanged) {
          // see if the current object (rr|rp|rs) value that was changed matches the one changed last round
          scissorsTrend++; // if it does, then increase trend by 1
        } else {
          scissorsTrend = 0; // if it doesn't then set trend to 0 to avoid a false flag trend
        }
        lastscissorsCatChanged = cat; // now that the test is over, set lastrockCatChanged to cat so next round when we go back up to the condition it equals this round's changed value
        break;
    }
    temp.push(rockTrend, paperTrend, scissorsTrend); // push the new values to temp
    for (var i = 0; i < temp.length; i++) {
      // iterate over them to see if any index value >= 3
      if (temp[0] >= 3) {
        // if so, run predictiveTrend with that argument
        trend = "rock";
      } else if (temp[1] >= 3) {
        trend = "paper";
      } else if (temp[2] >= 3) {
        trend = "scissors";
      }
    }
    temp = []; // now empty temp for the next round
    if (trend !== undefined) {
      // if trend has a value then it means a value was set because one category has 3+ trend
      predictiveTrend(trend);
    } else {
      // otherwise we are looking at historical data for our choice
      iterateDynamicObject();
    }
  }

  function predictiveTrend(predChoice) {
    console.log("running predTrend with " + predChoice);
    if (predChoice === "rock") {
      // if user tends to mostly select rock after seeing the computer's most recent round choice
      compChoice = "Paper"; // then computer shall thwart him with paper
    } else if (predChoice === "paper") {
      //if user tends to mostly select paper after seeing the computer's most recent round choice
      compChoice = "Scissors"; // computer shall sink his battleship with scissors
    } else if (predChoice === "scissors") {
      // if user.... oh you get the point.
      compChoice = "Rock";
    }
    $("#comp" + compChoice + "")
      .children()
      .addClass("rps__selected"); // dynamically set computer choice text based on compchoice
    seeWhoWon();
  }

  function iterateDynamicObject() {
    // iterate over the dynamic object to retrieve all value properties of our dynamic object
    // 1. we can look at the 3 objects nested within properties of that particular object (Xr|Xp|Xs where 'X' is the category and we want to view objects (r, p, and s))
    // 2. the goal of this function is to determine which of these 3 objects has the HIGHEST object.value property
    var rockData = Object.values(tendencyCats[dynamicCategory][0]); // lets get the property names and values of each object within the XCat category (rockCat, paperCat, scissorCat)
    var paperData = Object.values(tendencyCats[dynamicCategory][1]);
    var scissorData = Object.values(tendencyCats[dynamicCategory][2]);
    var temp = []; // create a hold for these values
    temp.push(rockData, paperData, scissorData); // push the values to it
    getMaxValue(temp); // and run getMaxValue to sort the array indexes by value
  }

  function getMaxValue(arr) {
    arr.sort(function(a, b) {
      // then sort those values, keeping the 'name' and 'value' properties tied together
      return b[1] - a[1]; // sort largest to smallest
    });
    largestTendency = arr[0][0]; // and now we can retrieve the first value of temp[0] (which will be Xr|Xp|Xs) knowing that it is the largest tendency choice for the user
    largestTendency = largestTendency.charAt(largestTendency.length - 1); // get the last letter of this string/value because that will be r,p, or s and will indicate what he's most likely to throw
    predictiveHistory(largestTendency); // pass that value to predictiveComp in order to make our choice
  }

  function predictiveHistory(predChoice) {
    // WHY DOES THE COMP ALWAYS STICK ON ONE CATEGORY IF THE USER HITS THE SAME OVER AND OVER
    if (predChoice === "r") {
      // if user tends to mostly select rock after seeing the computer's most recent round choice
      compChoice = "Paper"; // then computer shall thwart him with paper
    } else if (predChoice === "p") {
      //if user tends to mostly select paper after seeing the computer's most recent round choice
      compChoice = "Scissors"; // computer shall sink his battleship with scissors
    } else if (predChoice === "s") {
      // if user.... oh you get the point.
      compChoice = "Rock";
    }
    $("#comp" + compChoice + "")
      .children()
      .addClass("rps__selected"); // dynamically set computer choice text based on compchoice
    seeWhoWon();
  }

  function seeWhoWon() {
    // pretty self-explanatory.  base result variable on comparison of userResponse and compChoice to see who won
    switch (userResponse) {
      case "userRock":
        if (compChoice === "Rock") {
          result = "Tie";
        } else if (compChoice === "Paper") {
          result = "AI wins";
        } else if (compChoice === "Scissors") {
          result = "user wins";
        }
        break;
      case "userPaper":
        if (compChoice === "Rock") {
          result = "user wins";
        } else if (compChoice === "Paper") {
          result = "Tie";
        } else if (compChoice === "Scissors") {
          result = "AI wins";
        }
        break;
      case "userScissors":
        if (compChoice === "Rock") {
          result = "AI wins";
        } else if (compChoice === "Paper") {
          result = "user wins";
        } else if (compChoice === "Scissors") {
          result = "Tie";
        }
        break;
    }

    if (result === "user wins") {
      // if user wins
      $(".rps__selected").addClass("win");
    } else if (result === "AI wins") {
      // if AI wins
      $(".rps__selected").addClass("lose");
    } else if (result === "Tie") {
      // if round is a tie
      $(".rps__selected").addClass("tie");
    }
  }
});
