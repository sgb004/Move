function Move( _this, a ){
		var d = {
			'parentsClass': '',
			'boxesClass': '',
			change: function(){}
		};

		jQuery.extend(d, a);

		this.container = $(_this);
		this.boxes = $( this.container ).find( d.boxesClass );
		this.parentsClass = d.parentsClass;
		this.moveContainer = '<div class="move-float-container"></div>';
		this.cloneContainer;
		this.elementHover;
		this.elementFloat;
		this.elementFloatOffset = { top: 0, left: 0 };
		this.change = d.change;

		this.init( this );

		return this;
	}

	Move.prototype = {
		init: function( _this ){
			this.addEventListeners( this.boxes );

			window.addEventListener( 'touchmove', function( e ){

				if( _this.cloneContainer != undefined ){
					e = e || window.event;
					if (e.preventDefault){
						e.preventDefault();
					}
					e.returnValue = false;
				}

				var p = e;
				if( e.changedTouches != undefined ){
					if( e.changedTouches[0] != undefined ){
						p = e.changedTouches[0];
					}
				}
				_this._move( p );
			}, false );
			window.addEventListener( 'touchend', function( e ){
				var p = e;
				if( e.changedTouches != undefined ){
					if( e.changedTouches[0] != undefined ){
						p = e.changedTouches[0];
					}
				}
				_this._stop( p.clientX, p.clientY );
			}, false );

			$(window).on('mousemove', function(e){
				_this._move( e );
			});

			$(window).on('mouseup', function(e){
				_this._stop( e.clientX, e.clientY );
			});
		},
		addEventListeners: function( boxes ){
			var _this = this;

			boxes.on('mousedown', function(e){
				e.preventDefault();
				e.stopPropagation();
				_this._start( $(this), e.pageX, e.pageY );
			});

			for( var i=0; i<boxes.length; i++ ){
				boxes[i].addEventListener( 'touchstart', function(e){
					e.stopPropagation();

					var p = e;
					if( e.changedTouches != undefined ){
						if( e.changedTouches[0] != undefined ){
							p = e.changedTouches[0];
						}
					}
					_this._start( $(this), p.pageX, p.pageY );

					return false;
				}, false);
				boxes[i].addEventListener( 'touchmove', function( e ){
					var p = e;
					if( e.changedTouches != undefined ){
						if( e.changedTouches[0] != undefined ){
							p = e.changedTouches[0];
						}
					}
					_this._move( p );
				}, false );
				boxes[i].addEventListener( 'touchend', function( e ){
					var p = e;
					if( e.changedTouches != undefined ){
						if( e.changedTouches[0] != undefined ){
							p = e.changedTouches[0];
						}
					}
					_this._stop( p.clientX, p.clientY );
				}, false );
			}
		},
		_start: function( box, posX, posY ){
			var clone, content, dimentions;

			this.elementFloat = box.closest( this.parentsClass );
			this.elementFloatOffset = this.elementFloat.offset();

			clone = this.elementFloat.clone();
			content = this.elementFloat.prop( 'tagName' );
			dimentions = {
				'width': this.elementFloat.outerWidth( true ),
				'height': this.elementFloat.outerHeight( true )
			};
			content = content.toUpperCase();

			if( content == 'TR' || content == 'THEAD' || content == 'TBODY' || content == 'tfoot' ){
				var rows, row, rowDimensions;
				var parentRows = this.elementFloat.find('td, th');
				content = $('<table></table>');
				content.append( clone );
				rows = content.find( 'td, th' );
				for( var i=0; i<parentRows.length; i++ ){
					row = $( parentRows[i] );
					rowDimensions = {
						'width': row.outerWidth( true )
					};
					$( rows[i] ).css( rowDimensions );
				}
			}else if( content == 'TD' || content == 'TH' ){
				content = $('<tr></tr>');
				content.append( clone );
				content = $('<table></table>').append( content );
			}else{
				content = clone;
			}

			clone.css( dimentions );

			this.cloneContainer = $(this.moveContainer);
			this.cloneContainer.append( content );
			this.cloneContainer.css({ 
				'width': dimentions.width,
				'height': dimentions.height,
				'top': this.elementFloatOffset.top, 
				'left': this.elementFloatOffset.left,
				'marginTop': this.elementFloatOffset.top - posY
			});

			$('body').append( this.cloneContainer );

			this._move( {pageX: posX, pageY: posY} );
		},
		_move: function( p ){
			if( this.cloneContainer != undefined ){
				this.cloneContainer.css({'display': 'none'});

				this.elementHover = $( document.elementFromPoint( p.clientX, p.clientY ) );
				$('.move-hover').removeClass( 'move-hover' );
				this.elementHover = this.elementHover.closest( this.parentsClass );

				if( this.elementHover.length > 0 ){
					this.elementHover.addClass( 'move-hover' );
				}

				this.cloneContainer.css( {'top': p.pageY } );
				this.cloneContainer.css({'display': 'block'});
			}
		},
		_stop: function(x, y){
			if( this.cloneContainer != undefined ){
				$('.move-hover').removeClass( 'move-hover' );
				$('.move-float-container').remove();
				this.cloneContainer = undefined;

				this.elementHover = $( document.elementFromPoint( x, y ) );
				this.elementHover = this.elementHover.closest( this.parentsClass );

				if( this.elementHover.length > 0 ){
					this._change();
				}
			}
		},
		_change: function(){
			var elementHoverOffset = this.elementHover.offset();
			var distanceY = this.elementFloatOffset.top - elementHoverOffset.top;

			if( distanceY < 0 ){
				this.elementFloat.insertAfter( this.elementHover );
			}else{
				this.elementFloat.insertBefore( this.elementHover );
			}

			this.change();
		}
	};
