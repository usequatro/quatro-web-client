import difference from 'lodash/difference';
import flow from 'lodash/flow';

const applyAdded = (state, added) => ({
  allIds: [...state.allIds, ...Object.keys(added)],
  byId: {
    ...state.byId,
    ...added,
  },
});
const applyModified = (state, modified) => ({
  allIds: state.allIds,
  byId: Object.keys(state.byId).reduce(
    (memo, id) => ({
      ...memo,
      [id]: {
        ...state.byId[id],
        ...(modified[id] || {}),
      },
    }),
    {},
  ),
});
const applyRemoved = (state, removed) => {
  const removedIds = Object.keys(removed);
  return {
    allIds: difference(state.allIds, removedIds),
    byId: Object.keys(state.byId)
      .filter((id) => !removedIds.includes(id))
      .reduce(
        (memo, id) => ({
          ...memo,
          [id]: state.byId[id],
        }),
        {},
      ),
  };
};

/**
 * @param {Object} state
 * @param {Object} changes
 * @returns {Object}
 */
export const applyGroupedEntityChanges = (state, { added, modified, removed }) =>
  flow([
    (s) => applyModified(s, modified),
    (s) => applyRemoved(s, removed),
    (s) => applyAdded(s, added),
  ])(state);

/**
 * @param {firebase.firestore.QuerySnapshot} querySnapshot
 * @param {Function} validateSchema
 * @returns {Object}
 */
export const formatQuerySnapshotChanges = (querySnapshot, validateSchema) => {
  const hasLocalUnsavedChanges = querySnapshot
    .docChanges({ includeMetadataChanges: true })
    .reduce((memo, change) => memo || change.doc.metadata.hasPendingWrites, false);

  const groupedChangedEntities = querySnapshot
    .docChanges()
    // Extract documents into plain objects
    .map((change) => ({
      type: change.type,
      entity: [change.doc.id, change.doc.data()],
    }))
    // validate and filter out invalids
    .map(({ entity: [id, data], ...rest }) => {
      const { value, error } = validateSchema(data, { sync: true });
      if (error) {
        console.error(error, id, data); // eslint-disable-line no-console
        return null;
      }
      return { ...rest, entity: [id, value] };
    })
    .filter(Boolean)
    // Group them by type of change
    .reduce(
      (memo, { type, entity: [id, data] }) => ({
        ...memo,
        [type]: {
          ...memo[type],
          [id]: data,
        },
      }),
      { added: {}, modified: {}, removed: {} },
    );

  const hasEntityChanges =
    Object.keys(groupedChangedEntities.added).length > 0 ||
    Object.keys(groupedChangedEntities.modified).length > 0 ||
    Object.keys(groupedChangedEntities.removed).length > 0;

  return { groupedChangedEntities, hasEntityChanges, hasLocalUnsavedChanges };
};
