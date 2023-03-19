import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import "swiper/css";
import { Navigation } from "swiper";
import "swiper/css/navigation";

const MySlider = ({ slides, renderContent }: any) => {
  const swiperParams = {
    spaceBetween: 10,
    pagination: false,
    slidesPerView: 1,
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      // when window width is >= 480px
      640: {
        slidesPerView: 1,
        spaceBetween: 30,
      },
      // when window width is >= 768
      768: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
    },
  };

  return (
    <Swiper {...swiperParams} className="relative">
      {slides.map((slide: any, index: any) => (
        <SwiperSlide key={index}>
          <div>{renderContent(slide)}</div>
        </SwiperSlide>
      ))}
      <SlideNextButton />
      <SlidePrevButton />
    </Swiper>
  );
};

function SlideNextButton() {
  const swiper = useSwiper();

  return (
    <button
      className="bg-white w-14 h-14 shadow  focus:shadow-md focus:bg-slate-100 rounded-full absolute right-4 top-0 bottom-0 z-10 inline-flex items-center justify-center"
      onClick={() => swiper.slideNext()}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 text-emerald-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
        />
      </svg>
    </button>
  );
}

function SlidePrevButton() {
  const swiper = useSwiper();

  return (
    <button
      className="bg-white w-14 h-14 shadow focus:shadow-md focus:bg-slate-100  rounded-full absolute left-4 top-0 bottom-0 z-10 inline-flex items-center justify-center "
      onClick={() => swiper.slidePrev()}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 text-emerald-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      </svg>
    </button>
  );
}

export default MySlider;
