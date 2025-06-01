import {
  ACTION_INITIATORS,
  ACTION_TYPES,
  type ActionInitiator,
  type ActionType,
} from "./utils";

const audio = document.querySelector("audio");

const playAudio = () => {
  if (!audio) return;

  audio.volume = 1;
  audio.play();
};

const stopAudio = () => {
  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
};

chrome.runtime.onMessage.addListener(
  async (message: { action: ActionType; initiator: ActionInitiator }) => {
    if (message.initiator !== ACTION_INITIATORS.offscreen) return;

    switch (message.action) {
      case ACTION_TYPES.startReminder:
        return playAudio();

      case ACTION_TYPES.stopReminder:
        return stopAudio();
    }
  }
);
