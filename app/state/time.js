function reducer(state=0, action) {
  switch (action.type) {
    case 'time':
      // Increment game time
      return state + action.payload;
  }
  return state;
}

export default { reducer };
