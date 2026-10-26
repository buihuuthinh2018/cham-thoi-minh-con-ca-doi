# Chậm thôi, mình còn cả đời

MV hoạt hình chibi không lời thoại, vẽ bằng Canvas 2D rồi chiếu bằng WebGL. Một câu chuyện tình từ livestream TikTok đến những năm tháng già đi bên nhau. Dự án độc lập với phim “Cùng một thành phố”.

## Chạy trên máy

Từ thư mục dự án: `python -m http.server 4174 --bind 127.0.0.1 --directory dist` rồi mở http://127.0.0.1:4174/ . Python chỉ phục vụ các tệp tĩnh; phim, đồ họa và âm nhạc đều chạy bằng JavaScript trong trình duyệt. Có thể dùng bất kỳ máy chủ HTTP tĩnh nào.

## Âm nhạc

Nút “Xem MV cùng nhạc” mở bản cover Meader Music, giọng hát Yaning Tien: https://www.youtube.com/watch?v=FreZ0f-To-o . Nguồn đăng cho phép dùng video/âm thanh kèm liên kết ghi nguồn; giao diện đã ghi rõ tác giả và dẫn về kênh. Bản thu chính thức được thử nhưng bị chặn nhúng (YouTube 150); MV chính thức dài hơn bài hát nên không dùng làm nhạc nền mặc định. Liên kết tới MV của Karen Mok vẫn có ở giao diện: https://www.youtube.com/watch?v=kqqraGvoqVs .

Không có bản nhạc giả hoặc nhạc tổng hợp thay thế. Trình phát nhúng phụ thuộc mạng và việc YouTube cho phép phát trong trình duyệt. Có thể chọn tệp nhạc hợp lệ trên máy; tệp chỉ được đọc bằng Object URL trong trình duyệt, không tải lên máy chủ. “Xem hình ảnh trước” là chế độ không có âm thanh, được ghi rõ trong giao diện. Bản cover được kiểm tra phát thành công, thời lượng trình phát 3:46.

35 cảnh có nhịp dựng tham chiếu 4 phút 48 giây. Khi thời lượng bản nhạc được đọc, thời gian phim được quy đổi theo tổng thời lượng bản thu. Các thao tác phát, dừng và tua dùng đồng hồ của nguồn âm thanh. Đây là đồng bộ theo thời lượng, chưa phải dựng khớp từng nhịp hoặc từng câu hát cho mọi bản cover.

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
