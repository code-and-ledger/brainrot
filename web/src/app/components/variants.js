export const fadeInUp = {
  initial: {
    y: 40,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,

    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
};
export const fadeInUpHero = {
  initial: {
    y: 50,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,

    transition: {
      duration: 1,
      ease: "easeInOut",
    },
  },
};

export const fadeInDown = {
  initial: {
    y: -60,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,

    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};
