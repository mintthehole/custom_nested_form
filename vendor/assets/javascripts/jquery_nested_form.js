(function($) {
  window.CustomNestedFormEvents = function() {
    this.addCustomFields = $.proxy(this.addCustomFields, this);
    this.addFields = $.proxy(this.addFields, this);
    this.removeFields = $.proxy(this.removeFields, this);
    this.removeCustomFields = $.proxy(this.removeCustomFields, this);
  };

  CustomNestedFormEvents.prototype = {
    addFields: function(e) {
      // Setup
      var link      = e.currentTarget;
      var assoc     = $(link).data('association');                // Name of child
      var blueprint = $('#' + $(link).data('blueprint-id'));
      var content   = blueprint.data('blueprint');                // Fields template

      // Make the context correct by replacing <parents> with the generated ID
      // of each of the parent objects
      var context = ($(link).closest('.fields').closestChild('input, textarea, select').eq(0).attr('name') || '').replace(new RegExp('\[[a-z_]+\]$'), '');

      // context will be something like this for a brand new form:
      // project[tasks_attributes][1255929127459][assignments_attributes][1255929128105]
      // or for an edit form:
      // project[tasks_attributes][0][assignments_attributes][1]
      if (context) {
        var parentNames = context.match(/[a-z_]+_attributes(?=\]\[(new_)?\d+\])/g) || [];
        var parentIds   = context.match(/[0-9]+/g) || [];

        for(var i = 0; i < parentNames.length; i++) {
          if(parentIds[i]) {
            content = content.replace(
              new RegExp('(_' + parentNames[i] + ')_.+?_', 'g'),
              '$1_' + parentIds[i] + '_');

            content = content.replace(
              new RegExp('(\\[' + parentNames[i] + '\\])\\[.+?\\]', 'g'),
              '$1[' + parentIds[i] + ']');
          }
        }
      }

      // Make a unique ID for the new child
      var regexp  = new RegExp('new_' + assoc, 'g');
      var new_id  = this.newId();
      content     = $.trim(content.replace(regexp, new_id));

      var field = this.insertFields(content, assoc, link);
      // bubble up event upto document (through form)
      field
        .trigger({ type: 'nested:fieldAdded', field: field })
        .trigger({ type: 'nested:fieldAdded:' + assoc, field: field });
      return false;
    },
    addCustomFields: function(e) {
      // Setup
      var link      = e.currentTarget;

      var assoc     = $(link).data('association');                // Name of child
      var blueprint = $('#' + $(link).data('blueprint-id'));
      var content   = blueprint.data('blueprint');                // Fields template

      // Make the context correct by replacing <parents> with the generated ID
      // of each of the parent objects
      var context = ($(link).closest('.fields').closestChild('input, textarea, select').eq(0).attr('name') || '').replace(/\[[a-z_]+\]$/, '');
      // If the parent has no inputs we need to strip off the last pair
      var current = content.match(new RegExp('\\[([a-z_]+)\\]\\[new_' + assoc + '\\]'));
      if (current) {
        context = context.replace(new RegExp('\\[' + current[1] + '\\]\\[(new_)?\\d+\\]$'), '');
      }

      // context will be something like this for a brand new form:
      // project[tasks_attributes][1255929127459][assignments_attributes][1255929128105]
      // or for an edit form:
      // project[tasks_attributes][0][assignments_attributes][1]
      if (context) {
        var parentNames = context.match(/[a-z_]+_attributes(?=\]\[(new_)?\d+\])/g) || [];
        var parentIds   = context.match(/[0-9]+/g) || [];

        for(var i = 0; i < parentNames.length; i++) {
          if(parentIds[i]) {
            content = content.replace(
              new RegExp('(_' + parentNames[i] + ')_.+?_', 'g'),
              '$1_' + parentIds[i] + '_');

            content = content.replace(
              new RegExp('(\\[' + parentNames[i] + '\\])\\[.+?\\]', 'g'),
              '$1[' + parentIds[i] + ']');
          }
        }
      }

      // Make a unique ID for the new child
      var regexp  = new RegExp('new_' + assoc, 'g');
      var new_id  = this.newId();
      content     = $.trim(content.replace(regexp, new_id));

      var field = this.insertFields(content, assoc, link);
      // bubble up event upto document (through form)

      field
        .trigger({ type: 'nested:fieldAdded', field: field })
        .trigger({ type: 'nested:fieldAdded:' + assoc, field: field });
      return new_id;
    },
    newId: function() {
      return new Date().getTime();
    },
    insertFields: function(content, assoc, link) {
      var target = $(link).data('target');
      if (target) {
        return $(content).appendTo($(target));
      } else {
        return $(content).insertBefore(link);
      }
    },
    removeFields: function(id) {
      var hiddenField = $('#'+id).prev('input[type=hidden]');
      hiddenField.val('1');
      return false;
    },
    removeCustomFields: function(id) {
      var hiddenField = $("[id$='"+id+"']");
      hiddenField.val('1');
      return false;
    }
  };

  window.CustomNestedFormEvents = new CustomNestedFormEvents();

})(jQuery);

// http://plugins.jquery.com/project/closestChild
/*
 * Copyright 2011, Tobias Lindig
 *
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 */


(function($) {
        $.fn.closestChild = function(selector) {
                // breadth first search for the first matched node
                if (selector && selector != '') {
                        var queue = [];
                        queue.push(this);
                        while(queue.length > 0) {
                                var node = queue.shift();
                                var children = node.children();
                                for(var i = 0; i < children.length; ++i) {
                                        var child = $(children[i]);
                                        if (child.is(selector)) {
                                                return child; //well, we found one
                                        }
                                        queue.push(child);
                                }
                        }
                }
                return $();//nothing found
        };
})(jQuery);

$(document).ready(function() {
  $(".add_custom_nested_fields").live("click",function(event){
    event.preventDefault();
    new_id =CustomNestedFormEvents.addCustomFields(event);
    $(this).attr('generated_id',new_id);
    $(this).removeClass('add_custom_nested_fields');
    $(this).addClass('remove_custom_nested_fields');
    $('#val_'+new_id).val($(this).data('value'));
    if ($('#entity_'+new_id)){
      $('#entity_'+new_id).val($(this).data('entity'));
    }
  });

  $(".remove_custom_nested_fields").live("click",function(event){
    event.preventDefault();
    CustomNestedFormEvents.removeFields($(this).attr('generated_id'));
    $(this).addClass('add_custom_nested_fields');
    $(this).removeClass('remove_custom_nested_fields');
    $(this).removeAttr('generated_id');
    return false;
  });

  $(".custom_field_for_multiple_select").live("change",function(event,params){
    event.preventDefault();
    if (params.selected){
      new_id = CustomNestedFormEvents.addCustomFields(event);
      var added_id = $(".chosen-choices > .search-choice").last()[0].id
      var length = $(this).val().length;
      var added_value = $(this).val()[length - 1];
      $("#"+added_id).find(".search-choice-close").attr("generated_id",new_id);
      $("#"+added_id).find(".search-choice-close").addClass("remove_custom_nested_fields_mselect");
      $('#val_'+new_id).val(added_value);
    }
    return false;
  });

  $(".search-choice-close").live("click",function(event){
    var li = $(this).closest('li');
    var no = $(li).index();
    var association = $(this).attr("data-association");
    if (association != 'undefined'){
      var id = association+"_attributes_"+no+"__destroy";
      CustomNestedFormEvents.removeCustomFields(id);
    }
    return false;
  });

  $(".remove_custom_nested_fields_mselect").live("click",function(event){
    CustomNestedFormEvents.removeFields($(this).attr('generated_id'));
    return false;
  });

  $(".remove_custom_nested_fields_link").live("click",function(event){
    CustomNestedFormEvents.removeFields($(this).attr('generated_id'));
    return false;
  });
});