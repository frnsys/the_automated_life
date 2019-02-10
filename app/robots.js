function reducer(state=[], action) {
  switch (action.type) {
    case 'robot:create':
      state.push(action.payload);
      return [...state];
  }
  return state;
}

export default {
  reducer: reducer,
  initialState: []
};
