
import React from 'react'

export default ({iconsrc, title, subtitle, collapsible, collapsed, onCollapse, onDblClick}) => (
  <div
    style={styles.container}
    onDoubleClick={onDblClick}
    >
    {collapsible ?
      <div style={styles.collapser} onClick={() => onCollapse(!collapsed)}>
      {collapsed ?  '▸' : '▾'}
      </div> :
        <div style={styles.nocollapse}/>}
    <div style={{
      ...styles.icon,
      backgroundImage: 'url(' + iconsrc + ')',
    }} />
    <div style={styles.titles}>
    <div style={{
      ...styles.title,
      ...(title[0] === '.' ? styles.hiddenTitle : {})
    }}>{title}</div>
    {subtitle && <div style={styles.subTitle}>{subtitle}</div>}
    </div>
  </div>
)

const styles = {
  container: {
    WebkitUserSelect: 'none',
    userSelect: 'none',
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
    alignItems: 'center',
    paddingBottom: 5,
  },
  collapser: {
    cursor: 'pointer',
    padding: 5,
    width: 20,
    boxSizing: 'border-box',
  },
  nocollapse: {
    width: 20,
  },
  icon: {
    width: 20,
    height: 30,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    marginRight: 10,
    backgroundColor: '#fff',
    boxShadow: '0 0 3px #555',
  },
  title: {
    fontSize: 16,
    color: '#666',
  },
  hiddenTitle: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#aaa',
  },
  titles: {
    display: 'flex',
    flexDirection: 'column',
  },
  subTitle: {
    fontSize: 10,
    color: '#aaa',
  },
}


