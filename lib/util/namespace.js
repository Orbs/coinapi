'use strict';

/**
 * Verifies and/or creates an object heirarchy off of the parent object. If parent is
 * not specified, then the global object is used as the parent.
 *
 * As the heirarchy is traversed, existing objects in the specified namespace are left
 * unmodified. If during the traversal an object doesn't have the necessary property,
 * a new property is added with an empty object as the value. This continues until the
 * entire namespace heirarchy has been verified and/or created.
 *
 * If the third 'value' argument is included, the last property in the object heirarchy
 * will be assigned to this value instead of an empty object. However, this only happens
 * if the last property does not already exist and is created.
 *
 * @param  {String} namespaceString dot delimited string of namespace to create
 * @param  {Object} parent          object to add namespace to
 * @param  {Any}    value           value to assign the last object in namespace
 * @return {Any}                    returns reference to last object in namespace
 */
function namespace(namespaceString, parent, value) {
  var parts = namespaceString.split('.');
  var currentPart = '';
  parent = parent || this;

  for (var i=0, len=parts.length; i < len; i++) {
    currentPart = parts[i];
    // TODO: next line will fail if value is passed as 0, '', false, null, etc.
    parent[currentPart] = parent[currentPart] || (i+1===len && value ? value : {});
    parent = parent[currentPart];
  }

  return parent;
}

module.exports = namespace;
