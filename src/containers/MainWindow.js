import { Rectangle, RowLayout, Window } from 'react-qml';
import { connect } from 'react-redux';
import * as React from 'react';

import { accountListSelector, initAccount, initUser } from '../state/account';
import AppMenu from './AppMenu';
import ChannelList from './ChannelList';
import ErrorBoundary from '../components/ErrorBoundary';
import LoginWindow from './LoginWindow';
import ResourceLoader from '../components/ResourceLoader';
import TeamList from './TeamList';

const connectToRedux = connect(
  state => ({
    accountList: accountListSelector(state),
  }),
  {
    initAccount,
    initUser,
  }
);

const windowX = localStorage.getItem('windowX') || 100;
const windowY = localStorage.getItem('windowY') || 100;
const windowWidth = localStorage.getItem('windowWidth') || 800;
const windowHeight = localStorage.getItem('windowHeight') || 600;

class MainWindow extends React.PureComponent {
  windowRef = React.createRef();

  onClosing = ev => {
    // persist window's geometry
    const $window = this.windowRef.current;
    if ($window) {
      localStorage.setItem('windowX', $window.x);
      localStorage.setItem('windowY', $window.y);
      localStorage.setItem('windowWidth', $window.width);
      localStorage.setItem('windowHeight', $window.height);
    }

    ev.accepted = true;
  };

  onAppStateChanged = state => {
    // on app activate, show the window (if already closed)
    const $window = this.windowRef.current;
    if (!$window.visible && state === Qt.ApplicationActive) {
      $window.open();
    }
  };

  componentDidMount() {
    Object.keys(this.props.accountList).forEach(id => {
      const account = this.props.accountList[id];
      this.props.initAccount({ token: account.token, teamId: account.team });
      this.props.initUser({ token: account.token, teamId: account.team });
    });
    Qt.application.stateChanged.connect(this.onAppStateChanged);
  }

  componentWillUnmount() {
    Qt.application.stateChanged.disconnect(this.onAppStateChanged);
  }

  render() {
    return (
      <ResourceLoader>
        <Window
          visible
          onClosing={this.onClosing}
          x={windowX}
          y={windowY}
          width={windowWidth}
          height={windowHeight}
          title="Tey"
          flags={Qt.Window | Qt.WindowFullscreenButtonHint}
          ref={this.windowRef}
        >
          <ErrorBoundary>
            <AppMenu />
            <LoginWindow />
            <RowLayout anchors={{ fill: 'parent' }} spacing={0}>
              <Rectangle
                Layout={{
                  fillHeight: true,
                  preferredWidth: 68,
                }}
                color="#191F26"
              >
                <TeamList />
              </Rectangle>
              <Rectangle
                width={220}
                Layout={{
                  fillHeight: true,
                }}
                color="#323E4C"
              >
                <ChannelList />
              </Rectangle>
              <Rectangle
                Layout={{
                  fillWidth: true,
                  fillHeight: true,
                }}
                color="#FFFFFF"
              />
            </RowLayout>
          </ErrorBoundary>
        </Window>
      </ResourceLoader>
    );
  }
}

export default connectToRedux(MainWindow);
