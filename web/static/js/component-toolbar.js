/**
 * Toolbar jQuery component
 */
(function($) {
	var Toolbar = function(elem, options) {
		this.elem = elem;
		this.$elem = $(elem);
		this.options = options;
		this.metadata = this.$elem.data('toolbar-options');
	};

	Toolbar.prototype = {
		defaults: {

		},

		init: function() {
			var that = this;
			this.settings = $.extend({}, this.defaults, this.options, this.metadata);

			// Init component
			// Hide filter input, will be shown when implemented using prepareFilter
			this.filterWrap = this.elem.find('.filter').hide();

			return this;
		},

		/**
		 * Called by each page to setup header filter
		 * @param placeholder Input placeholder
		 * @param onFilterChange Called each time the input text changes
		 */
		prepareFilter: function(placeholder, onFilterChange) {
			// Toggle filter container visibility
			this.filterWrap.show();

			var input = this.filterWrap.find('#filter'),
				cancel = this.filterWrap.find('#cancelFilter');

			// Set placeholder
			input.attr('placeholder', placeholder);

			// Create a delay function to avoid triggering filter on each keypress
			var delay = (function(){
				var timer = 0;
				return function(callback, ms){
					clearTimeout(timer);
					timer = setTimeout(callback, ms);
				};
			})();

			// Define some functions
			/**
			 * Adds or updates current filter as GET parameter in URL
			 */
			var updateFilterInURL = function() {
				// Put the filter query in the URL (to keep it when refreshing the page)
				var query = $('#filter').val();

				saveState('filter', query);
			};

			/**
			 * Transforms a string to weaken filter
			 * 	(= get more filter results)
			 * @param filterExpr
			 */
			var sanitizeFilter = function(filterExpr) {
				return $.trim(filterExpr.toLowerCase());
			};

			input.on('keyup', function() {
				var val = $(this).val();

				delay(function() {
					if (val != '')
						cancel.show();
					else
						cancel.hide();

					// Call onFilterChange
					onFilterChange(val);
					updateFilterInURL();
				}, 200);
			});

			cancel.click(function() {
				input.val('');
				$(this).hide();
				onFilterChange('');
				updateFilterInURL();
			});

			// Register ESC key: same action as cancel filter
			$(document).keyup(function(e) {
				if (e.keyCode == 27 && input.is(':focus') && input.val().length > 0)
					cancel.click();
			});

			// There may be a 'filter' GET parameter in URL: let's apply it
			var qs = new Querystring();
			if (qs.contains('filter')) {
				input.val(qs.get('filter'));
				// Manually trigger the keyUp event on filter input
				input.keyup();
			}
		},

		/**
		 * Returns true whenever a result matches the filter expression
		 * @param filterExpr User-typed expression
		 * @param result Candidate
		 */
		filterMatches: function(filterExpr, result) {
			return sanitizeFilter(result).indexOf(sanitizeFilter(filterExpr)) != -1;
		}
	};

	Toolbar.defaults = Toolbar.prototype.defaults;

	$.fn.toolbar = function(options) {
		return new Toolbar(this.first(), options).init();
	};

	window.Toolbar = Toolbar;
}(jQuery));
