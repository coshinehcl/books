let list = [
    { title: 'babel', children: [ [Object] ] },
    { title: 'commander', children: [ [Object], [Object] ] },
    { title: 'iview', children: [ [Object] ] },
    { title: 'js', key: 'js' },
    {
      title: 'webpack-study',
      children: [ [Object], [Object], [Object], [Object] ]
    }
  ]
  let record = {
    commander: 201,
    updateTime: '2021-10-10T09:04:09.365Z',
    babel: 9,
    'webpack-study': 7
  }
  list.sort((l,r) => {
      console.log(l.title,r.title,record[l.title] < record[r.title])
    const leftV = record[l.title] || 0;
    const rightV =  record[r.title] || 0;
    if( leftV < rightV) {
        return 1;
    } else if(leftV < rightV) {
        return 0
    } else {
        return -1
    }
})
console.log(list)