jpg2 = (name) ->
  center ->
    img src: "http://#{name}.jpg.to", style: 'max-height: 90%;max-width:90%'

slide = (title, jpg) ->
  section '.container.hero-unit', ->
    h1 style: 'margin-bottom: 20px;', title if title?
    jpg2 jpg if jpg?

item = (desc, link) -> li -> a href: link, desc

slide 'hello world', 'goodmorning'
