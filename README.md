# Chậm thôi, mình còn cả đời

MV hoạt hình chibi không lời thoại, vẽ bằng Canvas 2D rồi chiếu bằng WebGL. Một câu chuyện tình từ livestream TikTok đến những năm tháng già đi bên nhau. Dự án độc lập với phim “Cùng một thành phố”.

## Chạy trên máy

Từ thư mục dự án: `python -m http.server 4174 --bind 127.0.0.1 --directory dist` rồi mở http://127.0.0.1:4174/ . Python chỉ phục vụ các tệp tĩnh; phim, đồ họa và âm nhạc đều chạy bằng JavaScript trong trình duyệt. Có thể dùng bất kỳ máy chủ HTTP tĩnh nào.

## Âm nhạc và phụ đề

MV dùng trực tiếp file MP3 do người dùng cung cấp, đã chép nguyên vẹn vào `dist/audio/cham-cham-thich-em.mp3` (226.533875 giây). Nhấn “Xem MV cùng nhạc” để bắt đầu âm thanh và phim cùng lúc. Không có iframe, API hoặc trình phát YouTube. Có thể xem không nhạc hoặc chọn tệp khác bằng điều khiển sẵn có. Python chỉ phục vụ tệp tĩnh; phát nhạc dùng HTML Audio.

52 dòng phụ đề tiếng Việt được chuyển từ bản thu và canh theo thời gian giọng hát. Phần dạo nhạc không hiển thị lời. Nút CC bật/tắt phụ đề; khi tua hoặc tạm dừng, phụ đề dùng cùng đồng hồ với MP3. Nội dung phụ đề ở `dist/lyrics.js`; bản WebVTT ở `dist/subtitles/vi.vtt`. Bản dịch chọn cách xưng hô anh/em để phù hợp câu chuyện. Thời gian câu hát dựa trên nhận dạng âm thanh, đã sửa nội dung theo ngữ cảnh; có thể tiếp tục tinh chỉnh mốc từng câu khi dựng bản cuối.

35 cảnh dùng nhịp dựng tham chiếu 4:48, được quy đổi theo thời lượng MP3 để kết thúc cùng nhạc. Tệp nhạc được phát trực tiếp cùng bản MV, không cần mở YouTube.

## GitHub Pages

Repository: https://github.com/buihuuthinh2018/cham-thoi-minh-con-ca-doi

Địa chỉ MV: https://buihuuthinh2018.github.io/cham-thoi-minh-con-ca-doi/

Workflow `.github/workflows/pages.yml` chạy các kiểm tra rồi triển khai thư mục `dist/` khi push vào `main`. Có thể triển khai lại từ Actions → Deploy MV to GitHub Pages → Run workflow. Trong Settings → Pages, nguồn xuất bản là GitHub Actions. Mọi đường dẫn hình, nhạc và phụ đề đều tương đối để chạy trong thư mục con của Pages.

## Câu chuyện

1. Hai căn phòng, cùng một livestream. Bình luận về chiếc bánh giúp họ nhận ra nhau. Vài buổi tối sau, cô bắt đầu đợi một avatar quen thuộc.
2. Theo dõi nhau, nhắn tin, chơi cùng đội. Những câu hỏi nhỏ về bữa cơm biến thành mong đợi mỗi ngày. Cô tưởng tượng có người ngồi ở chiếc ghế đối diện.
3. Lần đầu gặp: thử áo, sửa tóc, ngại ngùng. Chiếc móc khóa hoa giúp nhận ra nhau; bó hoa mắc vào túi khiến cả hai bật cười. Hai ly nước ngọt và một miếng bánh mở đầu những ngày bên nhau.
4. Đi bộ, che ô, xem phim Hàn rồi đổi sang anime. Cô trêu sơn móng hồng cho anh. Khi cô buồn anh mang bánh; khi anh làm việc muộn cô mang cơm nhà. Một ván game thua gây giận dỗi, một ly ngọt giúp làm hòa. Chăm sóc đi từ cả hai phía.
5. Vẫn chiếc ghế ấy qua bốn mùa, những ngày bình thường và mái tóc bạc. Cô vẫn nóng tính khi thua game, anh vẫn nhớ chiếc bánh nhỏ. Hai người chia đôi bánh, xem lại ảnh chụp livestream ngày đầu. Kết: “Ngày ấy muốn ngồi cạnh em. Sau này, vẫn vậy.”

## Điều khiển và kiểm tra

Thanh tua, phát/tạm dừng, tắt tiếng, toàn màn hình, chọn khoảnh khắc. Space phát/dừng; mũi tên tua 5 giây khi không ở trong điều khiển. `?t=120` mở một khung hình ở giây tham chiếu 120 để xem bố cục. Canvas 2D tự thay thế khi WebGL không khả dụng.

`node tests/film.test.cjs` kiểm tra tính liên tục của các cảnh, 3 tư thế trong mỗi cảnh, tọa độ hữu hạn, cân bằng Canvas, vận tốc bước chân và phát/dừng/tua của đồng hồ xem trước.

Không cần build hoặc cài thư viện. `dist/` là toàn bộ bản phát hành.
