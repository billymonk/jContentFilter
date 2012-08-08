; (function($) {
  "use strict";

  $.jContentFilter = {};

  $.jContentFilter.options = {
    "filterSelector": "",
    "contentSelector": "",
    "reset": "reset",
    "animateSpeed": 500,
    "beforeFilter": null,
    "afterFilter": null
  };

  function _filterContent(element) {
    var $this = $(element),
        $contentSelector = $($.jContentFilter.options.contentSelector),
        $that = $this;

    if ($.jContentFilter.options.beforeFilter) {
      $.jContentFilter.options.beforeFilter.call(element);
    }

    $contentSelector.each(function(index) {
      var $this = $(this);

      if (!$this.hasClass($that.attr("class")) && !$that.hasClass($.jContentFilter.options.reset)) {
        $this.hide($.jContentFilter.options.animateSpeed);
      } else {
        $this.show($.jContentFilter.options.animateSpeed);
      }
    });

    if ($.jContentFilter.options.afterFilter) {
      $.jContentFilter.options.afterFilter.call(element);
    }
  }

  $.jContentFilter.filter = function(options) {
    $.extend($.jContentFilter.options, options);

    $($.jContentFilter.options.filterSelector).each(function(index) {
      var $this = $(this);

      $this.bind("click.jContentFilter", function(event) { _filterContent(event.target); });
    });
  };
}(jQuery));
