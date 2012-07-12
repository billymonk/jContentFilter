/*global
  jasmine: true, beforeEach: true, loadFixtures: true, it: true, expect: true, Constants: true,
  runs: true, waits: true, spyOn: true
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
});
