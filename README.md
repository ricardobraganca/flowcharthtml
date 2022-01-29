## flowcharthtml (pure javascript)

Add a tag `<rc-flowchart />`

  [demo](https://ricardobraganca.github.io/flowcharthtml/)

~~~html
    <rc-flowchart name="flowchart">

        <flow-box class="box" left="500" top="20" id='1' targets="2;3;4">START</flow-box>
        <flow-box class="box" left="500" top="200" id='2' targets="">TASK 1</flow-box>
        <flow-box class="box" left="300" top="200" id='3' targets="">TASK 2</flow-box>
        <flow-box class="box" left="700" top="200" id='4' targets="5">TASK 3</flow-box>
        <flow-box class="box" left="700" top="350" id='5' targets="">TASK 4</flow-box>

        <!-- Se nao tiver posiçao (top ou right) o elemento iniciará no menu de contexto -->
        <flow-box class="box" id='6' targets="">TASK 5</flow-box>
        <flow-box class="box" id='7' targets="">TASK 6</flow-box>
    </rc-flowchart>
~~~
    
   ![prev](https://ricardobraganca.github.io/flowcharthtml/img/prev.png)

* Double click to select a element.
* Double click in another element will trace a arrow.
* Repeat process to remove arrow.
* Right click to context menu (Remove or Add Element).
