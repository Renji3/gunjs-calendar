import React, { useEffect, useRef, useState } from "react";
import CalendarHour from "./CalendarHour.js";
import ReactTooltip from 'react-tooltip';

let getHours = (ref) => {
  let hours = [];
  for (let index = 0; index < 24; index++) {
    hours.push({setRef: (val) => { ref.current[index] = val }, getRef: () => ref.current[index] }) 
  }
  return hours
}

const CalendarDay = ({day, first, last, onClickFree, onClickHour}) => {
  let [ renderd, setRenderd ] = useState(false);
  useEffect(() => { 
    if(!renderd) setRenderd(true);
    let rerender = () => {setRenderd(Math.random()*1000)}
    window.addEventListener("resize", rerender)
    return () => window.removeEventListener("resize", rerender)
  },[renderd])

  let date = new Date(day.date)
  let weekday = weekDayToDay[date.getDay()]
  let monthDay = date.getDate() + "."
  let hourRef = useRef([])
  let hours = getHours(hourRef);

  let isCurrentDay = isToday(date)

  let hoursComponents = [];
  if(renderd){
    day.hours.forEach((hour) => {
      let startHour = (new Date(hour.start)).getHours()
      let startMinute = (new Date(hour.start)).getMinutes()
      let endHour = (new Date(hour.end)).getHours()
      let endMinute = (new Date(hour.end)).getMinutes()
      let affectedHours = endMinute ? hours.slice(startHour-1, endHour) : hours.slice(startHour-1, endHour-1) 

      let startRef = affectedHours[0].getRef()
      let endRef = affectedHours[affectedHours.length -1].getRef()

      let top = startRef.offsetTop + startRef.offsetHeight * (startMinute / 60)
      let height = ( endRef.offsetTop + endRef.offsetHeight ) - top - endRef.offsetHeight * endMinute / 60 ;
      let width = startRef.offsetWidth;

      let hourClicked = () => { onClickHour && onClickHour(hour) }

      hoursComponents.push(
        <div 
          className="absolute opacity-60 cursor-pointer"
          style={{top: `${affectedHours}px`, width, height, top, left:0, backgroundColor: stringToColour(hour.what || "") }}
          data-tip={`What: ${hour.what}<br/>Start:${getHourString(startHour, startMinute)}<br/>End: ${getHourString(endHour, endMinute)}`}
          onClick={hourClicked}
        >
          <ReactTooltip type={"dark"} multiline effect="float" border />
        </div>
      )
    })
  }

  return <div className={`h-auto grow flex flex-col relative`}>
    <CalendarHour
      key={"header"}
      bigText={weekday}
      firstWeek={true}
      firstHour={true}
      lastWeek={last}
      lastHour={false}
      isCurrentDay={isCurrentDay}
    />
    { hours.map(( hour, index) => {
      let currentHour = new Date(day.date).setHours(index,0,0,0)
      let smalltext = index + 1;
      smalltext = smalltext < 10? "0" + smalltext + ":00" : smalltext + ":00"
      return (
        <CalendarHour 
          refFunc={hour.setRef}
          key={index}
          smallText={smalltext} 
          lastWeek={last}
          lastHour={index === hours.length -1}
          onClickFree={() => {onClickFree && onClickFree(currentHour)}}
        />
      )
    })} 
    {hoursComponents}
  </div>;
}

export default CalendarDay; 

let weekDayToDay = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
function stringToColour(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

function getHourString(hour, minute){
  let hourString = Number(hour) > 9 ? hour : "0" + hour;
  hourString += ":"
  if(!minute) hourString += "00";
  else hourString += Number(minute) > 9 ? minute : "0" + minute
  return hourString;
}

function isToday(someDate){
  const today = new Date()
  return someDate.getDate() == today.getDate() &&
    someDate.getMonth() == today.getMonth() &&
    someDate.getFullYear() == today.getFullYear()
}