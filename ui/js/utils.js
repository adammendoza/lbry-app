/**
 * Thin wrapper around localStorage.getItem(). Parses JSON and returns undefined if the value
 * is not set yet.
 */
export function getLocal(key) {
  const itemRaw = localStorage.getItem(key);
  return itemRaw === null ? undefined : JSON.parse(itemRaw);
}

/**
 * Thin wrapper around localStorage.setItem(). Converts value to JSON.
 */
export function setLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Records a publish attempt in local storage. Returns a dictionary with all the data needed to
 * needed to make a dummy claim or file info object.
 */
export function savePendingPublish(name) {
  const pendingPublishes = getLocal('pendingPublishes') || [];
  const newPendingPublish = {
    claim_id: 'pending_claim_' + name,
    txid: 'pending_' + name,
    nout: 0,
    outpoint: 'pending_' + name + ':0',
    name: name,
    time: Date.now(),
  };
  setLocal('pendingPublishes', [...pendingPublishes, newPendingPublish]);
  return newPendingPublish;
}

export function removePendingPublish({name, outpoint}) {
  setLocal('pendingPublishes', getPendingPublishes().filter(
    (pub) => pub.name != name && pub.outpoint != outpoint
  ));
}

/**
 * Gets the current list of pending publish attempts. Filters out any that have timed out and
 * removes them from the list.
 */
export function getPendingPublishes() {
  const pendingPublishes = getLocal('pendingPublishes') || [];

  const newPendingPublishes = [];
  for (let pendingPublish of pendingPublishes) {
    if (Date.now() - pendingPublish.time <= lbry.pendingPublishTimeout) {
      newPendingPublishes.push(pendingPublish);
    }
  }
  setLocal('pendingPublishes', newPendingPublishes);
  return newPendingPublishes
}

/**
 * Gets a pending publish attempt by its name or (fake) outpoint. If none is found (or one is found
 * but it has timed out), returns null.
 */
export function getPendingPublish({name, outpoint}) {
  const pendingPublishes = getPendingPublishes();
  const pendingPublishIndex = pendingPublishes.findIndex(
    ({name: itemName, outpoint: itemOutpoint}) => itemName == name || itemOutpoint == outpoint
  );
  const pendingPublish = pendingPublishes[pendingPublishIndex];

  if (pendingPublishIndex == -1) {
    return null;
  } else if (Date.now() - pendingPublish.time > lbry.pendingPublishTimeout) {
    // Pending publish timed out, so remove it from the stored list and don't match

    const newPendingPublishes = pendingPublishes.slice();
    newPendingPublishes.splice(pendingPublishIndex, 1);
    setLocal('pendingPublishes', newPendingPublishes);
    return null;
  } else {
    return pendingPublish;
  }
}

export function pendingPublishToDummyClaim({name, outpoint, claim_id, txid, nout}) {
  return {
    name: name,
    outpoint: outpoint,
    claim_id: claim_id,
    txid: txid,
    nout: nout,
  };
}

export function pendingPublishToDummyFileInfo({name, outpoint, claim_id}) {
  return {
    name: name,
    outpoint: outpoint,
    claim_id: claim_id,
    metadata: "Attempting publication",
  };
}
