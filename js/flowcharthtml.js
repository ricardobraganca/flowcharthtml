class FlowchartHtml extends HTMLElement {

    constructor(){
        super();

        this.mousepressed = false;

        document.addEventListener('mousemove', (e)=>{
            e.preventDefault();

            if(this.mousepressed){

                console.log((window.innerWidth / 2) - e.clientX)
                //window.scroll(this.posStart + e.clientX, 500)
            }
        })

        document.addEventListener('mousedown', (e)=>{

            this.mousepressed = true;
        })

        document.addEventListener('mouseup', (e)=>{

            this.mousepressed = false;
        })

        this.el_source="";
        this.el_target="";
        this.el_source_toolbox;
        this.mouseX = 0;
        this.mouseY = 0;
        this.right_clicked_el;
        this.element_hidden = document.createElement('input');
        this.element_hidden.type='hidden';
        this.grid = document.createElement('div');
        this.grid.classList.add('flowchart-grid')

        if(this.getAttribute('name')){

            this.element_hidden.name = this.getAttribute('name');
        }

        this.initFlowBox = new DOMParser().parseFromString(this.innerHTML,'text/html').body.querySelectorAll('flow-box');
        this.innerHTML = "";
        this.elements_box = [];
        this.toolbar = this.create_toolbar();
        this.append(this.toolbar);

        this.remove_button = this.create_button_remove();
        
        this.toolbar.append(this.remove_button)

        for(let i=0; i<this.initFlowBox.length; i++){

            if(this.initFlowBox[i].getAttribute('top') && this.initFlowBox[i].getAttribute('left')){

                let el = this.create_box(this.initFlowBox[i]);
                this.elements_box.push(el);
                this.append(el);
            }else{

                this.toolbar.append( this.change_to_toolbar_item(this.initFlowBox[i]) );
            }

            this.generate_json();
        }

        this.stg = document.createElement('div')

        this.append(this.grid)
        this.append(this.stg)
        this.append(this.element_hidden)

        this.generate_json();
    }

    connectedCallback(){

        document.addEventListener('contextmenu' , (ev)=>{
            ev.preventDefault();
            this.toolbar.style.left = ev.clientX + "px";
            this.toolbar.style.top = ev.clientY + "px";
            this.toolbar.style.display="flex";
            this.mouseX = ev.clientX + "px";
            this.mouseY = ev.clientY + "px";
            this.right_clicked_el = ev.target;
        })

        document.addEventListener("click", (evt)=>{

            this.toolbar.style.display="none";

            this.generate_json();
        })
  
        this.drawlines();
    }

    create_button_remove(){

        let button = document.createElement('button');
        button.style.position = "inherit";
        button.style.top = "0";
        button.innerHTML="REMOVE";
        button.classList.add('button-remove');
        button.addEventListener("click", ()=>{

            this.right_clicked_el.style.top=0;
            this.right_clicked_el.style.left=0;

            if(this.right_clicked_el.tagName === 'FLOW-BOX'){

                this.toolbar.append( this.change_to_toolbar_item( this.right_clicked_el ) );
                this.right_clicked_el.setAttribute('targets','');
                this.remove_target(this.right_clicked_el.id);
                this.drawlines();
            }

            this.toolbar.style.display="none";
        });

        return button;
    }

    create_box = (el_flow_box)=>{

        el_flow_box.setAttribute('draggable', 'true');
        el_flow_box.style.position='absolute';
        el_flow_box.style.top = el_flow_box.getAttribute('top') + 'px';
        el_flow_box.style.left = el_flow_box.getAttribute('left') + 'px';
        el_flow_box.addEventListener('mousemove', this.onMousemove)
        el_flow_box.addEventListener('dblclick', this.onDoubleClick)
        this.dragElement(el_flow_box);

        return el_flow_box;
    }

    create_toolbar = ()=>{

        let div = document.createElement('div');
        div.classList.add('toolbar');
        div.style.position = "relative";
        div.style.display = "none";
        div.style.flexDirection = "column";

        return div;
    }

    change_to_toolbar_item(el){

        el.setAttribute('draggable','true');
        el.addEventListener('dragover', this.onDragOverToolbar);
        el.addEventListener('drop', this.onDropToolbar);
        el.addEventListener('dragstart', this.onDragToolbar)
        el.style.position = "relative";
        el.style.display = "inline-block";

        el.addEventListener('click', function(evt){

            if(this.parentNode.parentNode.tagName === 'RC-FLOWCHART'){

                let el = this.parentNode.parentNode.create_box(this);
                el.style.left = this.parentNode.parentNode.mouseX;
                el.style.top = this.parentNode.parentNode.mouseY;
                this.parentNode.parentNode.toolbar.style.display="none";
                this.parentNode.parentNode.elements_box.push(el);
                this.parentNode.parentNode.prepend(el);
            }
        })

        return el;
    }

    onMousemove = ()=>{

       this.drawlines();
    }

    onDoubleClick(){

        if(!this.parentNode.el_source){

            this.parentNode.el_source = this;
            this.parentNode.el_source.classList.add('selected')
        }else{

            this.parentNode.el_target = this;
            this.parentNode.el_source.classList.remove('selected')
        }

        if(this.parentNode.el_target === this.parentNode.el_source){

            this.parentNode.el_target = "";
            this.parentNode.el_source = "";
        }

        if(this.parentNode.el_source && this.parentNode.el_target){

            let targets = [];

            if(this.parentNode.el_source.getAttribute('targets')){

                targets = this.parentNode.el_source.getAttribute('targets').split(';');
            }

            if(targets.includes(this.parentNode.el_target.id)){

                targets.forEach((item, index)=>{

                    if(this.parentNode.el_target.id == item){
                        targets.splice(index, 1);
                    }
                })
            }else{

                targets.push(this.parentNode.el_target.id)
            }
            
            this.parentNode.el_source.setAttribute('targets', targets.join(';'));
            this.parentNode.drawlines();
    
            this.parentNode.el_target = "";
            this.parentNode.el_source = "";
        }
    }

    remove_target(id){

        for(let i=0; i<this.elements_box.length; i++){

            let targets = this.elements_box[i].getAttribute('targets').split(";");

            if(targets.includes(id)){

                targets.forEach((item, index)=>{

                    if(id == item){
                        targets.splice(index, 1);
                    }
                })
            }

            this.elements_box[i].setAttribute('targets', targets.join(';'))
        }
    }

    drawlines = ()=>{

        this.stg.innerHTML = "";

        for(let i=0; i<this.elements_box.length; i++){

            let targets = this.elements_box[i].getAttribute('targets').split(";");
            let el1 = this.elements_box[i];

            for(let j=0; j<this.elements_box.length; j++){
                
                for(let k=0; k<targets.length; k++){

                    if(this.elements_box[j].id === targets[k]){

                        this.stg.innerHTML += this.connect(el1, this.elements_box[j], '', 5)
                    }
                }
            }
        }
    }

    dragElement(elmnt) {

        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (document.getElementById(elmnt.id + "header")) {

            document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
        } else {

            elmnt.onmousedown = dragMouseDown;
        }
    
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();

            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;

            document.onmousemove = elementDrag;
        }
    
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();

            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }
    
        function closeDragElement() {

            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    getOffset = (el) => {

        if(!el){
            return false;
        }

        const rect = el.getBoundingClientRect();
        return {
            left: rect.left + window.pageXOffset,
            top: rect.top + window.pageYOffset,
            width: rect.width || el.offsetWidth,
            height: rect.height || el.offsetHeight
        };
    }

    connect = (div1, div2, color, thickness) => {

        const off1 = this.getOffset(div1);
        const off2 = this.getOffset(div2);

        const x1 = off1.left + off1.width;
        const y1 = off1.top + off1.height;

        const x2 = off2.left + off2.width;
        const y2 = off2.top;

        const length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));

        const cx = (((x1 + x2) / 2) - (length / 2)) - off1.width / 2;
        const cy = ((y1 + y2) / 2) - (thickness / 2);

        const angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);

        const htmlLine = "<div class='flow-box-line' style='padding:0px; margin:0px; height:" + thickness + "px; background-color:" + color + "; line-height:1px; position:absolute; left:" + cx + "px; top:" + cy + "px; width:" + length + "px; -moz-transform:rotate(" + angle + "deg); -webkit-transform:rotate(" + angle + "deg); -o-transform:rotate(" + angle + "deg); -ms-transform:rotate(" + angle + "deg); transform:rotate(" + angle + "deg);' />";

        return htmlLine;
    }

    onDragOverToolbar(ev){

        ev.preventDefault();
    }   

    onDragToolbar(ev){
        
        this.parentNode.el_source_toolbox = this;
    }

    onDropToolbar(ev){

        ev.preventDefault();
    }

    generate_json(){

        let json = []
        for(let i=0; i<this.elements_box.length ; i++){

            let top = this.elements_box[i].style.top;
            let left = this.elements_box[i].style.left;

            if(top != "0px" && left != "0px"){
                let el_json = [];
                el_json = {
                    'id': this.elements_box[i].id,
                    'top': top,
                    'left': left,
                    'innerHtml': this.elements_box[i].innerHTML,
                    'targets': this.elements_box[i].getAttribute('targets'),
                    'class': this.elements_box[i].getAttribute('class')
                }

                json.push(el_json);
            }
        }

        this.element_hidden.value = JSON.stringify(json);
    }

}

customElements.define('rc-flowchart', FlowchartHtml);