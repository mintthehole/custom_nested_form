## Custom Nested Form
###### Extenstion of Nested Form

Ever Wondered how to make use of nested forms mor selectize.js 

Here is an example for multiple select and links as well.

Custom Nested Form Override Js
```haml
  = f.fields_for :association, :class => "hide" do |c|
    .custom_fields
      = c.text_field :field_name, :id => "val_new_association"
```
Replace assocation with actual assocation name and field name with actual field name

For Multiple Select with selectize
```haml
	= select_tag :some_field, options_for_select([]), :multiple => :multiple,"data-association" => :association, "data-blueprint-id" => :association_fields_blueprint, :class => "custom_field_for_multiple_select cselect"
```

Remove
add this as class
remove_custom_nested_fields_mselect


For link / select
```haml
	= link_to "link", "#", "data-association" => :association, "data-blueprint-id" => :association_fields_blueprint, :class => "add_custom_nested_fields","data-value" => value u want to set

Remove
add this as class
remove_custom_nested_fields