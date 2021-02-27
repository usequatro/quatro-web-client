import uniq from 'lodash/uniq';
import pull from 'lodash/pull';

/**
 * Returns a new array with added and/or removed elements
 * @param {Array<any>} array
 * @param {Object} params
 * @param {Array<any>} [params.add]
 * @param {Array<any>} [params.remove]
 * @return {Array<any>}
 */
export default function updateArray(array = [], { add = [], remove = [] }) {
  return pull(uniq([...array, ...add]), ...remove);
}
