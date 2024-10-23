// Import D3 and Observable runtime
import { Runtime, Inspector } from "@observablehq/runtime";
import * as d3 from "d3";

// Define the updated WPS hierarchy
const wps_hierarchy_updated = {
  '1.1 Game Setup': {
    '1.1.1 Murder Mystery Scenario': {
      '1.1.1.1 Script and Storyline': ['Develop script', 'Create plot and main clues'],
      '1.1.1.2 Character Roles': ['Assign roles', 'Prepare character profiles'],
      '1.1.1.3 Clue Cards and Evidence Sheets': ['Design and print clue cards', 'Create evidence sheets'],
      '1.1.1.4 Mystery-solving Tools': ['Procure tools', 'Distribute materials']
    },
    '1.1.2 Game Stages': {
      '1.1.2.1 Puzzle Design': ['Create puzzles for game phases'],
      '1.1.2.2 Team Clues Distribution': ['Organize and distribute team clues'],
      '1.1.2.3 Final Reveal of Murderer': ['Plan final scene of reveal']
    }
  },
  '1.2 Event Logistics': {
    '1.2.1 Venue Setup': {
      '1.2.1.1 Decorations': ['Set up Halloween decorations'],
      '1.2.1.2 Lighting': ['Install lighting'],
      '1.2.1.3 Sound System & DJ Booth': ['Set up sound system and DJ booth']
    },
    '1.2.2 Food and Drink Stands': {
      '1.2.2.1 Halloween-themed Snacks': ['Prepare snacks'],
      '1.2.2.2 Beverage Stands': ['Set up beverage stands']
    },
    '1.2.3 Logistics and Equipment': {
      '1.2.3.1 Fog Machine': ['Install and test fog machine'],
      '1.2.3.2 Photobooth': ['Set up photobooth with props'],
      '1.2.3.3 Clean-up and Waste Management': ['Organize clean-up crews']
    },
    '1.2.4 Security & First Aid': ['Ensure security presence', 'Arrange first aid staff']
  },
  '1.3 Marketing & Promotion': {
    '1.3.1 Social Media Campaign': {
      '1.3.1.1 Event Announcements': ['Post event announcements'],
      '1.3.1.2 Teasers': ['Release teasers and clues online']
    },
    '1.3.2 On-Campus Promotion': {
      '1.3.2.1 Posters and Flyers': ['Design and distribute posters'],
      '1.3.2.2 Volunteer Recruitment Ads': ['Post volunteer ads']
    },
    '1.3.3 Website Event Page': ['Create and maintain event page']
  },
  '1.4 Participation': {
    '1.4.1 Team Formation & Registration': {
      '1.4.1.1 Randomized Team Assignment': ['Form teams randomly'],
      '1.4.1.2 Participant Registration Forms': ['Manage registration forms']
    },
    '1.4.2 Game Rules & Instructions': ['Write and distribute rules']
  },
  '1.5 Rewards & Feedback': {
    '1.5.1 Prizes for Winning Team': ['Purchase and prepare prizes'],
    '1.5.2 Participation Goodies': ['Provide TSM-branded items'],
    '1.5.3 Post-Event Surveys': {
      '1.5.3.1 Satisfaction Survey': ['Distribute satisfaction survey'],
      '1.5.3.2 Impact Evaluation': ['Evaluate social impact']
    }
  }
};

// Flatten the hierarchy to create a list of links
let links = [];
function addLinks(hierarchy, parent) {
  for (let key in hierarchy) {
    if (parent !== null) {
      links.push({ source: parent, target: key });
    }
    if (typeof hierarchy[key] === 'object') {
      addLinks(hierarchy[key], key);
    }
  }
}
addLinks(wps_hierarchy_updated, null);

// Create the graph using D3.js
const width = 960;
const height = 600;

const svg = d3.select(DOM.svg(width, height))
  .attr("viewBox", [-width / 2, -height / 2, width, height]);

const simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(d => d.id).distance(100))
  .force("charge", d3.forceManyBody().strength(-400))
  .force("center", d3.forceCenter(0, 0));

// Convert links into D3-friendly format
const nodes = Array.from(new Set(links.flatMap(l => [l.source, l.target])), id => ({ id }));

const link = svg.append("g")
  .attr("stroke", "#999")
  .attr("stroke-opacity", 0.6)
  .selectAll("line")
  .data(links)
  .join("line")
  .attr("stroke-width", 1.5);

const node = svg.append("g")
  .attr("stroke", "#fff")
  .attr("stroke-width", 1.5)
  .selectAll("circle")
  .data(nodes)
  .join("circle")
  .attr("r", 5)
  .attr("fill", "lightcoral")
  .call(drag(simulation));

const label = svg.append("g")
  .selectAll("text")
  .data(nodes)
  .join("text")
  .attr("dy", -5)
  .attr("x", 6)
  .attr("y", 3)
  .text(d => d.id);

simulation.nodes(nodes).on("tick", () => {
  link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

  node
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

  label
    .attr("x", d => d.x)
    .attr("y", d => d.y);
});

simulation.force("link").links(links);

// Dragging functionality for nodes
function drag(simulation) {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  
  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

// Display the graph
svg.node();
