import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Event } from 'shared/entities/event';
import { styled } from 'client/ui/styles';
import { Background } from './background';
import { markerWidth, sidebarWidth } from 'client/ui/styles/constants';
import { Feed } from './feed';
import { Placeholder } from './placeholder';
import isMobile from 'ismobilejs';

export interface TimetableProps {
  events: Event[];
  onFetchEvents: () => void;
}

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin-left: 0;
  overflow-x: scroll;
  overflow-y: hidden; /* fixme */
  -webkit-overflow-scrolling: touch;

  @media screen and (min-width: 700px) {
    width: calc(100% - ${sidebarWidth}px);
    margin-left: ${sidebarWidth}px;
  }
`;

export const Timetable = (props: TimetableProps) => {
  const { events, onFetchEvents } = props;

  const ref = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!ref.current || !e.deltaY) return;
    ref.current.scrollBy({ left: e.deltaY });
  }, []);

  const startDate = useMemo(
    () =>
      events.reduce<Dayjs | undefined>((result, event) => {
        const date = dayjs(event.start_date);
        if (!result || date.isBefore(result)) return date;
        return result;
      }, undefined),
    [events],
  );

  const endDate = useMemo(
    () =>
      events.reduce<Dayjs | undefined>((result, event) => {
        const date = dayjs(event.end_date);
        if (!result || date.isAfter(result)) return date;
        return result;
      }, undefined),
    [events],
  );

  useEffect(() => {
    if (!ref.current || !startDate) return;

    const fromNowToStart = dayjs().diff(startDate, 'minute');
    const screenWidth = window.innerWidth;
    const x =
      (markerWidth / 30) * fromNowToStart - (screenWidth - sidebarWidth) / 2;

    ref.current.scrollTo(x, 0);
  }, [startDate, endDate]);

  useEffect(() => {
    if (isMobile.any || !ref.current) return;
    ref.current.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      if (isMobile.any || !ref.current) return;
      ref.current.removeEventListener('wheel', handleWheel);
    };
  });

  useEffect(() => {
    onFetchEvents();
  }, []);

  if (!events.length || !startDate || !endDate) {
    return (
      <Wrapper>
        <Placeholder />
      </Wrapper>
    );
  }

  return (
    <Wrapper ref={ref}>
      <Background startDate={startDate} endDate={endDate} />
      <Feed events={events} startDate={startDate} />
    </Wrapper>
  );
};
