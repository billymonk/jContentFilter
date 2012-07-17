/*global
  jasmine: true, beforeEach: true, loadFixtures: true, it: true, expect: true, Constants: true,
  runs: true, waits: true, spyOn: true, Window: true
*/

describe("jquery.jcontentfilter", function() {
  "use strict";

  var filterSelector = "#filter-container a",
      contentSelector = "#content-container div",
      $filterSelector,
      $contentSelector,
      $filterSelectorItem0,
      $filterSelectorReset;

  jasmine.getFixtures().fixturesPath = Constants.FIXTURES_PATH;

  beforeEach(function() {
    loadFixtures("index.html");
    $filterSelector = $(filterSelector);
    $contentSelector = $(contentSelector);
    $filterSelectorItem0 = $(filterSelector + ".item-0");
    $filterSelectorReset = $(filterSelector + "." + $.jContentFilter.options.reset);
  });

  describe("minimal implementation", function() {
    beforeEach(function() {
      $.jContentFilter.filter({
        "filterSelector": filterSelector,
        "contentSelector": contentSelector
      });
    });

    it("should bind click events under the jContentFilter namespace to filters specified by filterSelector", function() {
      // If we properly handle the filterSelector option in $.jContentFilter
      // then all elements selected by $filterSelector should have a click event
      // binded to them with the namespace Constants.NAMESPACE.
      $filterSelector.each(function(index, element) {
        expect($(element).data("events").click[0].namespace).toEqual(Constants.NAMESPACE);
      });
    });

    it("should filter content based on whether they have a class name equal to filter's class name", function() {
      // First let's make sure that we start with all $contentSelector
      // elements visible.
      $contentSelector.each(function(index, element) {
        expect($(element).is(":visible")).toBeTruthy();
      });

      // Now let's filter out all items except those who have the class 'item-0'.
      $filterSelectorItem0.click();

      // Wait until animation is complete so we are not checking for
      // items to be hidden before they are finished animating off the page.
      waits($.jContentFilter.options.animateSpeed);

      runs(function() {
        $contentSelector.each(function(index, element) {
          var $element = $(element);

          // Finally let's make sure that the only visible items are now those
          // with the class 'item-0' and that the elements that are not visible
          // do not have the class 'item-0'.
          if ($element.is(":visible")) {
            expect($element).toHaveClass("item-0");
          } else {
            expect($element).not.toHaveClass("item-0");
          }
        });
      });
    });

    it("should properly reset when filter with class $.jContentFilter.options.reset is clicked", function() {
      // Let's start by hiding every second $contentSelector element.
      $contentSelector.each(function(index, element) {
        if ((index % 2) !== 0) {
          $(element).hide();
        }
      });

      // Now let's make sure that we have actually hidden the elements like
      // we think we have.
      $contentSelector.each(function(index, element) {
        if ((index % 2) !== 0) {
          expect($(element)).not.toBeVisible();
        } else {
          expect($(element)).toBeVisible();
        }
      });

      // Next we'll reset the content.
      $filterSelectorReset.click();

      // All of our items selected by $contentSelector should now be visible.
      $contentSelector.each(function(index, element) {
        expect($(element)).toBeVisible();
      });
    });

    it("should use $.jContentFilter.options.animateSpeed when showing and hiding elements.", function() {
      // Spy on the function calls we're interested in so we can see that they are called with the
      // proper argument.
      spyOn(jQuery.fn, "show");
      spyOn(jQuery.fn, "hide");

      // Let's show and hide some elements.
      $filterSelectorItem0.click();

      // Then let's check that each of the show and hides were called with
      // $.jContentFilter.options.animateSpeed as an argument.
      $(jQuery.fn.show.calls.concat(jQuery.fn.hide.calls)).each(function(index, element) {
        expect(element.args[0]).toEqual($.jContentFilter.options.animateSpeed);
      });
    });
  });

  describe("beforeFilter and afterFilter callbacks", function() {
    var beforeFilter = function() {
      alert(this);
    }, 
    afterFilter = function() {
      alert(this);
    };

    beforeEach(function() {
      $.jContentFilter.filter({
        "filterSelector": filterSelector,
        "contentSelector": contentSelector,
        "beforeFilter": beforeFilter,
        "afterFilter": afterFilter
      });
    });

    it("should call beforeFilter before the filter has been applied", function() {
      // We want to make sure only our beforeFilter callback is run because the afterFilter
      // callback also calls window.alert and could potentially confuse our results.
      // For example if we wanted to check that our beforeFilter callback was only run once and
      // we did expect(window.alert.callCount).toEqual(1) it would fail if we had our afterFilter
      // callback set.
      $.jContentFilter.options.afterFilter = null;

      // Spy on window.alert because we expect it to be called if our beforeFilter callback is called.
      spyOn(window, "alert");
      // Spy on jQuery.fn.hide and jQuery.fn.show because we know that their being called is indicative
      // of our filter running.
      spyOn(jQuery.fn, "hide");
      spyOn(jQuery.fn, "show");

      // Let's set things in motion. Should filter out all items except those with the class item-0.
      $filterSelectorItem0.click();

      // Now let's check that our beforeFilter callback function ran before
      // we started showing and hiding elements.
      expect(window.alert).toHaveBeenCalledBefore(jQuery.fn.hide);
      expect(window.alert).toHaveBeenCalledBefore(jQuery.fn.show);
    });

    it("should call afterFilter after the filter has been applied", function() {
      // We want to make sure only our afterFilter callback is run because the beforeFilter
      // callback also calls window.alert and could potentially confuse our results.
      // For example if we also if our beforeFilter callback also ran then
      // expect(window.alert).toHaveBeenCalledBefore(jQuery.fn.hide) and
      // expect(window.alert).toHaveBeenCalledBefore(jQuery.fn.show) would be successful and we wouldn't
      // know if the window.alert being referred to was from our beforeFilter callback or our afterFilter callback.
      $.jContentFilter.options.beforeFilter = null;

      // Spy on window.alert because we expect it to be called if our afterFilter callback is called.
      spyOn(window, "alert");
      // Spy on jQuery.fn.hide and jQuery.fn.show because we know that their being called is indicative
      // of our filter running.
      spyOn(jQuery.fn, "hide");
      spyOn(jQuery.fn, "show");

      // Let's set things in motion. Should filter out all items except those with the class item-0.
      $filterSelectorItem0.click();

      // Now let's check that our afterFilter callback function ran after
      // we started showing and hiding elements. Note that this isn't a perfect test
      // because it only gaurantees that one jQuery.fn.hide method call and one jQuery.fn.show
      // method call was triggered before our afterFilter callback was called.
      expect(jQuery.fn.hide).toHaveBeenCalledBefore(window.alert);
      expect(jQuery.fn.show).toHaveBeenCalledBefore(window.alert);

      // To make up for the incompleteness above let's make sure that our window.alert call is the last
      // item in the spyCalls array and that it is the only window.alert call.
      expect($(jasmine.getEnv().currentSpec.spyCalls).last()[0].object).toEqual(jasmine.any(Window));
      expect(window.alert.callCount).toEqual(1);
    });

    it("should pass the clicked filter to the before filter", function() {
      // We want to make sure only our beforeFilter callback is run because the
      // afterFilter callback also calls window.alert and could potentially confuse
      // our results.
      $.jContentFilter.options.afterFilter = null;

      // Spy on window.alert because we expect it to be called if our beforeFilter callback
      // is called.
      spyOn(window, "alert");

      // Let's set things in motion. Should filter out all items except those with the class item-0.
      $filterSelectorItem0.click();

      // Since we call window.alert with 'this' as an argument let's check that its argument (we know
      // it should be the first one since it is only called with one) is the 'this' that we want to call
      // our beforeFilter callback with. 
      //
      // Let's check the tag and the className against $filterSelectorItem0's tag name and class name
      // since it is $filterSelectorItem0 (not as a jQuery object, though) that is passed to the beforeFilter
      // callback.
      expect(window.alert.argsForCall[0][0].nodeName).toEqual($filterSelectorItem0[0].nodeName);
      expect(window.alert.argsForCall[0][0].className).toEqual($filterSelectorItem0[0].className);
    });

    it("should pass the clicked filter to the after filter", function() {
      // We want to make sure only our afterFilter callback is run because the
      // berforeFilter callback also calls window.alert and could potentially confuse
      // our results.
      $.jContentFilter.options.beforeFilter = null;

      // Spy on window.alert because we expect it to be called if our afterFilter callback
      // is called.
      spyOn(window, "alert");

      // Let's set things in motion. Should filter out all items except those with the class item-0.
      $filterSelectorItem0.click();

      // Since we call window.alert with 'this' as an argument let's check that its argument (we know
      // it should be the first one since it is only called with one) is the 'this' that we want to call
      // our afterFilter callback with. 
      //
      // Let's check the tag and the className against $filterSelectorItem0's tag name and class name
      // since it is $filterSelectorItem0 (not as a jQuery object, though) that is passed to the afterFilter
      // callback.
      expect(window.alert.argsForCall[0][0].nodeName).toEqual("A");
      expect(window.alert.argsForCall[0][0].className).toEqual("item-0");
    });
  });
});
