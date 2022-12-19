import mitt from "mitt";

type Events = {
  confetti: undefined;
};

export const emitter = mitt<Events>();
