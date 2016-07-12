/**
 * Tells whether an element is contentEditable or not
 * @param $elem jQuery $(elem)
 * @returns {boolean}
 */
export default function ($elem) {
  return !!($elem.contentEditable && $elem.contentEditable === 'true');
}
