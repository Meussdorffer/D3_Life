// Conway's game of life

var height = 500, 
	width = 700, 
	sq_pad = 0,
	sq_size = 10;

var columns = Math.floor(width / sq_size),
	rows = Math.floor(height / sq_size);

// stores state and location data for cells
var grid_data = [];

// all 8 position deltas for each cell
var grid_deltas = [
	[-1,-1], [-1,0], [-1,1],
	[0,-1], [0,1],
	[1,-1],	[1,0], [1,1]
];

for (var i = 0; i < rows; i++) {
	grid_row = [];
	for(var j = 0; j < columns; j++) {
		// each square will have the following array:
		// [row pos, col pos, 0 or 1 (dead or alive)]
		// state = Math.round(Math.random());
		state = 0;
		grid_row.push([i,j,state]);
	}
	grid_data.push(grid_row);
}

var grid = d3.select("#grid")
	.append("svg")
	.attr('height', height)
	.attr('width', width)
	.selectAll("g")
	.data(grid_data)
	.enter().append("g")

var squares = grid.selectAll('rect')
	.data(function(d) {
		return d;
	})
	.enter().append('rect')
	.attr('width', sq_size - sq_pad)
	.attr('height', sq_size - sq_pad)
	.attr('id', function(d){
		return d[0] + ',' + d[1];
	})
	.attr('row', function(d) {
		return d[0];
	})
	.attr('col', function(d) {
		return d[1];
	})
	.attr('transform', function(d){
		var x_shift = d[1] * sq_size;
		var y_shift = d[0] * sq_size;
		return "translate(" + [x_shift, y_shift] + ")";
	})
	.attr('style', function(d) {
		var style = 'fill:';
		if(d[2] == 0) {
			style += 'black';
		} else {
			style += 'green';
		}
		return style;
	})
	.on('mouseover', function(d){
		var cur_state = grid_data[d[0]][d[1]][2];
		var next_state;
		var color;		
		if (cur_state == 0) {
			color = 'green';
			next_state = 1; 
		} else {
			color = 'black';
			next_state = 0;
		}
		this.style.fill = color;
		grid_data[d[0]][d[1]][2] = next_state;
	});



// function make_grid_green() {
// 	for (row in grid_data) {
// 		for (arr in grid_data[row]) {
// 			var cell_data = grid_data[row][arr];

// 			var square_id = '[id="' + cell_data[0] + "," + cell_data[1] + '"';
// 			var sq_status = cell_data[2];	

// 			var square = d3.select(square_id)
// 				.attr('style', 'fill:green');
// 		}
// 	}
// }

function check_cell_state(row, col, grid) {
	var state;
	if (((row < 0) || (col < 0)) || ((row >= rows) || (col >= columns))) {
		state = 0;
	} else {
		state = grid[row][col][2];
	}
	return state;
}

function get_state_rule(cell_state, alive_neighbors) {
	// Any live cell with fewer than two live neighbors dies, as if by underpopulation.
	// Any live cell with two or three live neighbors lives on to the next generation.
	// Any live cell with more than three live neighbors dies, as if by overpopulation.
	// Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.	
	var next_state;

	if(cell_state == 1) {
		if((alive_neighbors < 2) || (alive_neighbors > 3)) {
			next_state = 0;
		} else {
			next_state = 1;
		}
	} else {
		if(alive_neighbors == 3) {
			next_state = 1;
		} else {
			next_state = 0;
		}
	}

	return next_state;
}


function next_cell_state(row, col, cur_state, grid) {
	// check neighbors
	var living_neighbors = 0;
	
	for (delta in grid_deltas){
		living_neighbors += check_cell_state(
			row + grid_deltas[delta][0],
			col + grid_deltas[delta][1],
			grid
		);
	}

	// if(cur_state == 1) {
		// alert(living_neighbors);
	// }
	// set state based on neighbors
	var next_state = get_state_rule(cur_state, living_neighbors);

	return next_state;
}

// function update_cell_state(id, cur_state, next_state) {

// 	if(!(cur_state == next_state)) {

// 		var cell = d3.select(id);
// 		var fill = 'fill:';

// 		if(next_state == 0) {
// 			fill += 'black';
// 		} else {
// 			fill += 'green';
// 		}

// 		cell.attr('style', fill);
// 	}

// }

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run_simulation(epochs) {

	// var grid_data_copy = grid_data.slice();	
	var cell_data, cell_id, cell_row, cell_col, cell_state, next_state;

	for(var ep = 0; ep < epochs; ep++) {
		var svg_updates = [];
		var grid_updates = [];

		for (row in grid_data) {
			for (col in grid_data[row]) {

				cell_data = grid_data[row][col];
				cell_id = '[id="' + cell_data[0] + "," + cell_data[1] + '"';
				cell_row = cell_data[0];
				cell_col = cell_data[1];
				cell_state = cell_data[2];
				next_state = next_cell_state(cell_row, cell_col, cell_state, grid_data); 

				// grid updates
				if(next_state != cell_state) {
					grid_updates.push([row, col, next_state]);
				}

				// svg updates
				if(next_state == 1) {
					svg_updates.push('green');
				} else {
					svg_updates.push('black');
				}

				// update_cell_state(cell_id, cell_state, next_state);

			}
		}

		// update svg elements
		d3.selectAll('rect')
		  .data(svg_updates)
		  .attr('style', function(d) {
		  	return "fill: " + d;
		  });

		// update grid data
		for (i in grid_updates) {
			// alert(grid_updates[i])
			var row = grid_updates[i][0];
			var col = grid_updates[i][1];
			grid_data[row][col][2] = grid_updates[i][2];
		}

		await sleep(100);
	}
}
